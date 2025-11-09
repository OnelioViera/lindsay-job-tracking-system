import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import { Notification } from '@/lib/models/Notification';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const userId = (session.user as any).id;
    const searchParams = req.nextUrl.searchParams;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let query: any = { userId };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate('jobId', 'jobName jobNumber')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const userId = (session.user as any).id;
    const body = await req.json();
    const { notificationId, read } = body;

    if (!notificationId || typeof read !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Verify the notification belongs to the user
    const notification = await Notification.findOne({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    notification.read = read;
    await notification.save();

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
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
    const body = await req.json();
    const { action } = body;

    if (action === 'markAllRead') {
      // Mark all notifications as read for this user
      await Notification.updateMany(
        { userId, read: false },
        { $set: { read: true } }
      );

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const userId = (session.user as any).id;
    const searchParams = req.nextUrl.searchParams;
    const notificationId = searchParams.get('id');

    if (notificationId) {
      // Delete a specific notification
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId,
      });

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Notification deleted',
      });
    } else {
      // Delete all read notifications for this user
      await Notification.deleteMany({
        userId,
        read: true,
      });

      return NextResponse.json({
        success: true,
        message: 'All read notifications cleared',
      });
    }
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
}

