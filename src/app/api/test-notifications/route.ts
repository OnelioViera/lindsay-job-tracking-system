import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { Notification } from '@/lib/models/Notification';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    console.log('\n🧪 === TEST NOTIFICATION ENDPOINT ===');
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    await dbConnect();

    // Get current user
    const currentUserId = (session.user as any).id;
    console.log('1️⃣ Session user ID:', currentUserId);
    console.log('2️⃣ Session user object:', JSON.stringify(session.user, null, 2));
    
    const currentUser = await User.findById(currentUserId);
    console.log('3️⃣ User from database:', currentUser ? `${currentUser.name} (${currentUser.role})` : 'NOT FOUND');

    if (!currentUser) {
      return NextResponse.json({ 
        error: 'User not found in database',
        sessionId: currentUserId,
        session: session.user 
      }, { status: 404 });
    }

    // Find admins
    const adminUsers = await User.find({ role: 'Admin', isActive: true });
    console.log('4️⃣ Admin users found:', adminUsers.length);
    adminUsers.forEach(admin => {
      console.log(`   - ${admin.name} (${admin.email}) - ID: ${admin._id}`);
    });

    // Test notification creation
    if (adminUsers.length > 0) {
      const testNotification = await Notification.create({
        userId: adminUsers[0]._id,
        type: 'customer_created',
        title: 'TEST: Notification System Check',
        message: `Test notification triggered by ${currentUser.name} (${currentUser.role})`,
        read: false,
      });
      console.log('5️⃣ Test notification created:', testNotification._id);

      return NextResponse.json({
        success: true,
        message: 'Test notification created successfully!',
        data: {
          currentUser: {
            id: currentUser._id,
            name: currentUser.name,
            role: currentUser.role,
          },
          adminsFound: adminUsers.length,
          notificationId: testNotification._id,
        },
      });
    } else {
      return NextResponse.json({
        error: 'No admin users found',
        currentUser: {
          id: currentUser._id,
          name: currentUser.name,
          role: currentUser.role,
        },
      }, { status: 404 });
    }
  } catch (error: any) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}

