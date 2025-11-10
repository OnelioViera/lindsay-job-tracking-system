import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import { Job } from '@/lib/models/Job';
import { User } from '@/lib/models/User';
import { Notification } from '@/lib/models/Notification';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    const job = await Job.findById(id)
      .populate('customerId', 'name companyName email phone address')
      .populate('estimatorId', 'name email')
      .populate('drafterId', 'name email')
      .populate('projectManagerId', 'name email')
      .populate('createdBy', 'name email');

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Find the job first to ensure it exists
    const job = await Job.findById(id);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedUpdates = ['status', 'priority', 'notes', 'estimatorId', 'drafterId', 'projectManagerId'];
    const updates: any = {};

    for (const field of allowedUpdates) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    // Check if projectManagerId is being assigned (and wasn't previously assigned)
    const isNewPMAssignment = body.projectManagerId && !job.projectManagerId;

    // Update timestamps for status changes
    if (body.status) {
      if (body.status === 'Estimation' && !job.estimateDate) {
        updates.estimateDate = new Date();
      } else if (body.status === 'Drafting' && !job.draftStartDate) {
        updates.draftStartDate = new Date();
      } else if (body.status === 'In Production' && !job.productionStartDate) {
        updates.productionStartDate = new Date();
      } else if (body.status === 'Delivered' && !job.deliveryDate) {
        updates.deliveryDate = new Date();
      }
    }

    const updatedJob = await Job.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('customerId', 'name companyName email phone address')
      .populate('estimatorId', 'name email')
      .populate('drafterId', 'name email')
      .populate('projectManagerId', 'name email');

    // Create notification if PM was newly assigned
    if (isNewPMAssignment && body.projectManagerId) {
      try {
        const pmObjectId = new mongoose.Types.ObjectId(body.projectManagerId);
        const pmUser = await User.findById(pmObjectId);
        
        if (pmUser) {
          await Notification.create({
            userId: pmObjectId,
            type: 'job_assigned',
            title: 'New Job Assigned',
            message: `You have been assigned to job "${updatedJob.jobName}" (${updatedJob.jobNumber})`,
            jobId: new mongoose.Types.ObjectId(id),
          });
        }
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the request if notification creation fails
      }
    }

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }


    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Find the job first to ensure it exists
    const job = await Job.findById(id);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const userRole = (session.user as any).role;
    const currentUserId = (session.user as any).id;

    // Only Admin or the user who created the job (creator) can fully update
    const isCreator = job.createdBy ? job.createdBy.toString() === currentUserId : false;
    if (userRole !== 'Admin' && !isCreator) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins or the job creator can edit jobs' },
        { status: 403 }
      );
    }

    // Track if PM assignment changed or if job was updated for an assigned PM
    const hadPM = !!job.projectManagerId;
    const pmId = job.projectManagerId?.toString();
    const newPmId = body.projectManagerId?.toString();
    const pmChanged = hadPM && newPmId && pmId !== newPmId;
    const pmReassigned = !hadPM && newPmId;

    // Handle estimateDue field conversion
    const updateData = { ...body };
    if (body.estimateDue) {
      updateData.estimateDueDate = new Date(body.estimateDue);
      delete updateData.estimateDue;
    }

    // Update the job with all provided fields
    const updatedJob = await Job.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('customerId', 'name companyName email phone address')
      .populate('estimatorId', 'name email')
      .populate('drafterId', 'name email')
      .populate('projectManagerId', 'name email')
      .populate('createdBy', 'name email');

    // Create notifications for PM and Admin updates
    try {
      const currentUser = await User.findById(currentUserId);
      const jobObjectId = new mongoose.Types.ObjectId(id);
      
      // If PM was reassigned to a new person
      if (pmReassigned && newPmId) {
        const newPmObjectId = new mongoose.Types.ObjectId(newPmId);
        await Notification.create({
          userId: newPmObjectId,
          type: 'job_assigned',
          title: 'New Job Assigned',
          message: `You have been assigned to job "${updatedJob.jobName}" (${updatedJob.jobNumber})`,
          jobId: jobObjectId,
        });
      }
      // If PM changed from one to another
      else if (pmChanged && newPmId) {
        const newPmObjectId = new mongoose.Types.ObjectId(newPmId);
        await Notification.create({
          userId: newPmObjectId,
          type: 'job_assigned',
          title: 'New Job Assigned',
          message: `You have been assigned to job "${updatedJob.jobName}" (${updatedJob.jobNumber})`,
          jobId: jobObjectId,
        });
      }
      // If job was edited and PM is assigned (notify of update)
      else if (hadPM && pmId && !pmChanged) {
        const pmObjectId = new mongoose.Types.ObjectId(pmId);
        
        // Determine what changed
        const changes = [];
        if (body.jobName && body.jobName !== job.jobName) changes.push('job name');
        if (body.status && body.status !== job.status) changes.push('status');
        if (body.priority && body.priority !== job.priority) changes.push('priority');
        if (body.quotedAmount && body.quotedAmount !== job.quotedAmount) changes.push('quoted amount');
        if (body.notes && body.notes !== job.notes) changes.push('notes');
        
        if (changes.length > 0) {
          const changesText = changes.length === 1 
            ? changes[0] 
            : changes.slice(0, -1).join(', ') + ' and ' + changes[changes.length - 1];
          
          await Notification.create({
            userId: pmObjectId,
            type: 'job_updated',
            title: 'Job Updated',
            message: `Job "${updatedJob.jobName}" (${updatedJob.jobNumber}) has been updated. Changes: ${changesText}`,
            jobId: jobObjectId,
          });
        }
      }

      // ALWAYS notify all admins about job updates (unless the updater is an admin)
      if (userRole !== 'Admin') {
        const adminUsers = await User.find({ role: 'Admin', isActive: true });
        
        // Determine what changed for admin notification
        const changes = [];
        if (body.jobName && body.jobName !== job.jobName) changes.push('job name');
        if (body.status && body.status !== job.status) changes.push('status');
        if (body.priority && body.priority !== job.priority) changes.push('priority');
        if (body.quotedAmount && body.quotedAmount !== job.quotedAmount) changes.push('quoted amount');
        if (body.notes && body.notes !== job.notes) changes.push('notes');
        if (pmChanged || pmReassigned) changes.push('project manager');
        
        if (changes.length > 0 && adminUsers.length > 0) {
          const changesText = changes.length === 1 
            ? changes[0] 
            : changes.slice(0, -1).join(', ') + ' and ' + changes[changes.length - 1];
          
          const adminNotifications = adminUsers.map((admin) =>
            Notification.create({
              userId: admin._id,
              type: 'job_updated',
              title: 'Job Updated',
              message: `${currentUser?.name || 'A user'} (${userRole}) updated job "${updatedJob.jobName}" (${updatedJob.jobNumber}). Changes: ${changesText}`,
              jobId: jobObjectId,
            })
          );
          
          await Promise.all(adminNotifications);
          console.log(`✅ Created notifications for ${adminUsers.length} admin(s) about job update`);
        }
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the request if notification creation fails
    }

    return NextResponse.json({
      success: true,
      data: updatedJob,
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const userRole = (session.user as any).role;
    const currentUserId = (session.user as any).id;

    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Get the job before deleting to check for assigned PM
    const job = await Job.findById(id);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const isCreator = job.createdBy ? job.createdBy.toString() === currentUserId : false;
    // Only Admin or the creator can delete the job
    if (userRole !== 'Admin' && !isCreator) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins or the job creator can delete jobs' },
        { status: 403 }
      );
    }

    // Soft delete: set deletedAt timestamp
    const deletedJob = await Job.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );

    // Create notifications for PM and Admins
    try {
      const currentUser = await User.findById(currentUserId);
      const jobObjectId = new mongoose.Types.ObjectId(id);
      const deleterName = currentUser?.name || 'A user';
      const deleterRole = userRole || 'Unknown';

      // Notify PM if one was assigned
      if (job.projectManagerId) {
        const pmObjectId = new mongoose.Types.ObjectId(job.projectManagerId.toString());
        await Notification.create({
          userId: pmObjectId,
          type: 'job_deleted',
          title: 'Job Deleted',
          message: `Job "${job.jobName}" (${job.jobNumber}) has been deleted by ${deleterName} (${deleterRole})`,
          jobId: jobObjectId,
        });
        console.log(`✅ Notified PM about job deletion`);
      }

      // ALWAYS notify all admins about job deletions (unless the deleter is an admin)
      if (userRole !== 'Admin') {
        const adminUsers = await User.find({ role: 'Admin', isActive: true });
        
        if (adminUsers.length > 0) {
          const adminNotifications = adminUsers.map((admin) =>
            Notification.create({
              userId: admin._id,
              type: 'job_deleted',
              title: 'Job Deleted',
              message: `${deleterName} (${deleterRole}) deleted job "${job.jobName}" (${job.jobNumber})`,
              jobId: jobObjectId,
            })
          );
          
          await Promise.all(adminNotifications);
          console.log(`✅ Created notifications for ${adminUsers.length} admin(s) about job deletion`);
        }
      }
    } catch (notificationError) {
      console.error('Error creating deletion notifications:', notificationError);
      // Don't fail the request if notification creation fails
    }

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}

