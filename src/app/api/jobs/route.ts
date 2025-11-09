import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb';
import { Job } from '@/lib/models/Job';
import { Customer } from '@/lib/models/Customer';
import { jobCreateSchema } from '@/lib/validations/job';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const jobNumber = searchParams.get('jobNumber');
    const projectManagerId = searchParams.get('projectManagerId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    console.log(`[Jobs GET] User: ${(session.user as any).role}, ProjectManagerId param: ${projectManagerId}`);

    let query: any = { deletedAt: null };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (jobNumber) {
      query.jobNumber = jobNumber;
    }

    if (projectManagerId) {
      // Convert projectManagerId to MongoDB ObjectId for proper comparison
      if (mongoose.Types.ObjectId.isValid(projectManagerId)) {
        const pmObjId = new mongoose.Types.ObjectId(projectManagerId);
        query.projectManagerId = pmObjId;
        console.log(`[Jobs GET] Filtering by PM: ${projectManagerId}`);
      } else {
        // If projectManagerId is provided but invalid, return empty results
        console.log(`[Jobs GET] Invalid PM ID: ${projectManagerId}`);
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            limit,
            skip,
          },
        });
      }
    } else {
      console.log(`[Jobs GET] No projectManagerId filter, returning all jobs`);
    }
    
    const jobs = await Job.find(query)
      .populate('customerId', 'companyName name email phone')
      .populate('estimatorId', 'name email')
      .populate('drafterId', 'name email')
      .populate('projectManagerId', 'name email')
      .sort({ createdDate: -1 })
      .limit(limit)
      .skip(skip);
    
    console.log(`[Jobs GET] Final query:`, JSON.stringify(query));
    console.log(`[Jobs GET] Results: ${jobs.length} jobs found`);
    
    const total = await Job.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: jobs,
      pagination: {
        total,
        limit,
        skip,
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Parse form data (including file)
    const formData = await req.formData();
    const jobName = formData.get('jobName') as string;
    const jobNumber = formData.get('jobNumber') as string;
    const customerId = formData.get('customerId') as string;
    const quotedAmount = formData.get('quotedAmount') as string;
    const notes = formData.get('notes') as string;
    const quoteFile = formData.get('quoteFile') as File | null;

    // Build body for validation
    const body: any = {
      jobName,
      jobNumber,
      customerId,
      priority: 'medium', // Set default priority
      notes: notes || null,
    };

    if (quotedAmount) {
      body.quotedAmount = parseFloat(quotedAmount);
    }

    // Validate data
    const validatedData = jobCreateSchema.parse(body);

    // Verify customer exists
    const customer = await Customer.findById(validatedData.customerId);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    let quotePdfUrl: string | undefined;

    // Handle file upload if present
    if (quoteFile) {
      try {
        const bytes = await quoteFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create uploads directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'quotes');
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${jobNumber}-${timestamp}.pdf`;
        const filepath = join(uploadDir, filename);

        // Save file
        await writeFile(filepath, buffer);

        // Store relative URL for database
        quotePdfUrl = `/uploads/quotes/${filename}`;
      } catch (fileError) {
        console.error('Error saving quote PDF:', fileError);
        return NextResponse.json(
          { error: 'Failed to save quote PDF' },
          { status: 500 }
        );
      }
    }

    const job = await Job.create({
      ...validatedData,
      quotePdfUrl,
      createdDate: new Date(),
    });

    const populatedJob = await job.populate([
      { path: 'customerId', select: 'companyName name email phone' },
      { path: 'estimatorId', select: 'name email' },
      { path: 'drafterId', select: 'name email' },
      { path: 'projectManagerId', select: 'name email' },
    ]);

    return NextResponse.json(
      {
        success: true,
        data: populatedJob,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating job:', error);
    if (error.name === 'ValidationError' || error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors || error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}

