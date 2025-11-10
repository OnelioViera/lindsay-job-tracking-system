import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb';
import { Customer } from '@/lib/models/Customer';
import { User } from '@/lib/models/User';
import { Notification } from '@/lib/models/Notification';
import { customerCreateSchema } from '@/lib/validations/customer';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const customers = await Customer.find({ deletedAt: null }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
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

    const body = await req.json();
    const validatedData = customerCreateSchema.parse(body);

    const customer = await Customer.create(validatedData);
    console.log(`✅ Customer created: ${customer.companyName} (ID: ${customer._id})`);

    // Get current user's role and information
    const currentUserId = (session.user as any).id;
    console.log(`[Customer API] Current user ID from session: ${currentUserId}`);
    console.log(`[Customer API] Session user object:`, JSON.stringify(session.user, null, 2));
    
    const currentUser = await User.findById(currentUserId);
    console.log(`[Customer API] Current user found:`, currentUser ? `${currentUser.name} (${currentUser.role})` : 'NOT FOUND');

    // If a Project Manager created the customer, notify all admins
    if (currentUser && currentUser.role === 'Project Manager') {
      console.log(`[Customer API] PM detected, creating admin notifications...`);
      try {
        // Find all admin users
        const adminUsers = await User.find({ role: 'Admin', isActive: true });
        console.log(`[Customer API] Found ${adminUsers.length} admin users:`, adminUsers.map(a => `${a.name} (${a.email})`).join(', '));

        // Create notifications for all admins
        const notificationPromises = adminUsers.map((admin) =>
          Notification.create({
            userId: admin._id,
            type: 'customer_created',
            title: 'New Customer Added',
            message: `${currentUser.name} (Project Manager) added a new customer: "${customer.companyName}"`,
            customerId: customer._id,
          })
        );

        await Promise.all(notificationPromises);
        console.log(`✅ Created notifications for ${adminUsers.length} admin(s) about new customer`);
      } catch (notificationError) {
        console.error('❌ Error creating notifications:', notificationError);
        // Don't fail the customer creation if notification creation fails
      }
    } else {
      console.log(`[Customer API] Skipping admin notifications - User role: ${currentUser?.role || 'UNKNOWN'}`);
    }

    return NextResponse.json(
      {
        success: true,
        data: customer,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating customer:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

