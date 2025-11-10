import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import { Estimate } from '@/lib/models/Estimate';
import { Job } from '@/lib/models/Job';
import { User } from '@/lib/models/User';
import { Notification } from '@/lib/models/Notification';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;

    const estimate = await Estimate.findById(id)
      .populate('jobId', 'jobNumber jobName status customerId')
      .populate('estimatorId', 'name email')
      .populate('assignedPMId', 'name email');

    if (!estimate) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: estimate,
    });
  } catch (error) {
    console.error('Error fetching estimate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch estimate' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const { id } = await params;

    const estimate = await Estimate.findById(id);

    if (!estimate) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to update this estimate
    if (
      userRole !== 'Admin' &&
      estimate.estimatorId.toString() !== userId
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to update this estimate' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      structures,
      itemsToPurchase,
      laborCost,
      materialCost,
      equipmentCost,
      overheadCost,
      profitMargin,
      notes,
      status,
      assignedPMId,
    } = body;

    // Update fields if provided
    if (structures !== undefined) estimate.structures = structures;
    if (itemsToPurchase !== undefined) estimate.itemsToPurchase = itemsToPurchase;
    if (laborCost !== undefined) estimate.laborCost = laborCost;
    if (materialCost !== undefined) estimate.materialCost = materialCost;
    if (equipmentCost !== undefined) estimate.equipmentCost = equipmentCost;
    if (overheadCost !== undefined) estimate.overheadCost = overheadCost;
    if (profitMargin !== undefined) estimate.profitMargin = profitMargin;
    if (notes !== undefined) estimate.notes = notes;
    if (status !== undefined) estimate.status = status;

    const wasAssigned = !!estimate.assignedPMId;
    const previousPMId = estimate.assignedPMId?.toString();

    // Handle PM assignment
    if (assignedPMId !== undefined && assignedPMId !== previousPMId) {
      estimate.assignedPMId = assignedPMId || undefined;
      estimate.assignedDate = assignedPMId ? new Date() : undefined;

      // Create notification for PM assignment
      if (assignedPMId) {
        try {
          const currentUser = await User.findById(userId);
          const assignedPM = await User.findById(assignedPMId);
          const job = await Job.findById(estimate.jobId);

          if (assignedPM && job) {
            // Notify the assigned PM
            await Notification.create({
              userId: assignedPMId,
              type: 'quote_assigned',
              title: 'Quote Assigned to You',
              message: `${currentUser?.name || 'An estimator'} assigned you a quote for job "${job.jobName}" (${job.jobNumber}). Quoted price: $${estimate.quotedPrice.toFixed(2)}`,
              jobId: job._id,
              estimateId: estimate._id,
            });

            // Also update the job's projectManagerId if not already set
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
            
            console.log(`✅ Created notifications for PM and ${adminUsers.length} admin(s) about quote assignment`);
          }
        } catch (notificationError) {
          console.error('❌ Error creating assignment notifications:', notificationError);
          // Don't fail the estimate update if notification creation fails
        }
      }
    }

    // If status changed to submitted, create notifications
    if (status === 'submitted' && estimate.status !== 'submitted') {
      try {
        const currentUser = await User.findById(userId);
        const job = await Job.findById(estimate.jobId);
        
        if (job) {
          // Notify all admins
          const adminUsers = await User.find({ role: 'Admin', isActive: true });
          
          const adminNotifications = adminUsers.map((admin) =>
            Notification.create({
              userId: admin._id,
              type: 'quote_created',
              title: 'Quote Submitted',
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
        }
      } catch (notificationError) {
        console.error('❌ Error creating submission notifications:', notificationError);
      }
    }

    await estimate.save();

    const populatedEstimate = await estimate.populate([
      { path: 'jobId', select: 'jobNumber jobName status' },
      { path: 'estimatorId', select: 'name email' },
      { path: 'assignedPMId', select: 'name email' },
    ]);

    return NextResponse.json({
      success: true,
      data: populatedEstimate,
    });
  } catch (error: any) {
    console.error('Error updating estimate:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update estimate' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const { id } = await params;

    const estimate = await Estimate.findById(id);

    if (!estimate) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to delete this estimate
    if (
      userRole !== 'Admin' &&
      estimate.estimatorId.toString() !== userId
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this estimate' },
        { status: 403 }
      );
    }

    await estimate.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Estimate deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting estimate:', error);
    return NextResponse.json(
      { error: 'Failed to delete estimate' },
      { status: 500 }
    );
  }
}

