import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import { Estimate } from '@/lib/models/Estimate';
import { Job } from '@/lib/models/Job';
import { User } from '@/lib/models/User';
import { Notification } from '@/lib/models/Notification';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const searchParams = req.nextUrl.searchParams;
    
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');

    const query: any = {};

    // Filter based on user role
    if (userRole === 'Estimator') {
      // Estimators see only their own estimates
      query.estimatorId = userId;
    } else if (userRole === 'Project Manager') {
      // PMs see estimates assigned to them
      query.assignedPMId = userId;
    }
    // Admins see all estimates (no filter needed)

    if (jobId) {
      query.jobId = jobId;
    }

    if (status) {
      query.status = status;
    }

    const estimates = await Estimate.find(query)
      .populate('jobId', 'jobNumber jobName status')
      .populate('estimatorId', 'name email')
      .populate('assignedPMId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({
      success: true,
      data: estimates,
    });
  } catch (error) {
    console.error('Error fetching estimates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch estimates' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    // Check if user has permission to create estimates
    if (userRole !== 'Estimator' && userRole !== 'Admin') {
      return NextResponse.json(
        { error: 'You do not have permission to create estimates' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      jobId,
      structures = [],
      itemsToPurchase = [],
      laborCost = 0,
      materialCost = 0,
      equipmentCost = 0,
      overheadCost = 0,
      profitMargin = 30,
      notes,
      status = 'draft',
      assignedPMId,
    } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Get the latest version number for this job
    const latestEstimate = await Estimate.findOne({ jobId })
      .sort({ version: -1 })
      .limit(1);
    
    const version = latestEstimate ? latestEstimate.version + 1 : 1;

    // Create the estimate
    const estimate = await Estimate.create({
      jobId,
      version,
      estimatorId: userId,
      status,
      structures,
      itemsToPurchase,
      laborCost,
      materialCost,
      equipmentCost,
      overheadCost,
      profitMargin,
      notes,
      assignedPMId: assignedPMId || undefined,
      assignedDate: assignedPMId ? new Date() : undefined,
    });

    const populatedEstimate = await estimate.populate([
      { path: 'jobId', select: 'jobNumber jobName status' },
      { path: 'estimatorId', select: 'name email' },
      { path: 'assignedPMId', select: 'name email' },
    ]);

    // Handle notifications
    try {
      const currentUser = await User.findById(userId);
      
      // If estimate is submitted (not just a draft), create notifications
      if (status === 'submitted') {
        // Notify all admins
        const adminUsers = await User.find({ role: 'Admin', isActive: true });
        
        const adminNotifications = adminUsers.map((admin) =>
          Notification.create({
            userId: admin._id,
            type: 'quote_created',
            title: 'New Quote Submitted',
            message: `${currentUser?.name || 'An estimator'} submitted a quote for job "${job.jobName}" (${job.jobNumber}). Quoted price: $${estimate.quotedPrice.toFixed(2)}`,
            jobId: job._id,
            estimateId: estimate._id,
          })
        );

        // Notify all Project Managers
        const pmUsers = await User.find({ role: 'Project Manager', isActive: true });
        
        const pmNotifications = pmUsers.map((pm) =>
          Notification.create({
            userId: pm._id,
            type: 'quote_created',
            title: 'New Quote Available',
            message: `${currentUser?.name || 'An estimator'} submitted a quote for job "${job.jobName}" (${job.jobNumber}). Quoted price: $${estimate.quotedPrice.toFixed(2)}`,
            jobId: job._id,
            estimateId: estimate._id,
          })
        );

        await Promise.all([...adminNotifications, ...pmNotifications]);
        
        console.log(`✅ Created notifications for ${adminUsers.length} admin(s) and ${pmUsers.length} PM(s) about new quote`);
      }

      // If a PM was assigned during creation, send assignment notifications
      if (assignedPMId) {
        const assignedPM = await User.findById(assignedPMId);
        
        if (assignedPM) {
          // Notify the assigned PM
          await Notification.create({
            userId: assignedPMId,
            type: 'quote_assigned',
            title: 'Quote Assigned to You',
            message: `${currentUser?.name || 'An estimator'} assigned you a quote for job "${job.jobName}" (${job.jobNumber}). Quoted price: $${estimate.quotedPrice.toFixed(2)}`,
            jobId: job._id,
            estimateId: estimate._id,
          });

          // Update the job's projectManagerId if not already set
          if (!job.projectManagerId) {
            job.projectManagerId = assignedPMId;
            await job.save();
          }

          // Notify all admins about the assignment
          const adminUsers = await User.find({ role: 'Admin', isActive: true });
          const adminNotifications = adminUsers.map((admin) =>
            Notification.create({
              userId: admin._id,
              type: 'quote_assigned',
              title: 'Quote Assigned to PM',
              message: `${currentUser?.name || 'An estimator'} assigned a quote to ${assignedPM.name} for job "${job.jobName}" (${job.jobNumber})`,
              jobId: job._id,
              estimateId: estimate._id,
            })
          );

          await Promise.all(adminNotifications);
          
          console.log(`✅ Created PM assignment notifications for ${assignedPM.name} and ${adminUsers.length} admin(s)`);
        }
      }
    } catch (notificationError) {
      console.error('❌ Error creating notifications:', notificationError);
      // Don't fail the estimate creation if notification creation fails
    }

    return NextResponse.json(
      {
        success: true,
        data: populatedEstimate,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating estimate:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create estimate' },
      { status: 500 }
    );
  }
}

