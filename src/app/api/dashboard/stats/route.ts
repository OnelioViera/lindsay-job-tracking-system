import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import { Job } from '@/lib/models/Job';
import { Customer } from '@/lib/models/Customer';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    console.log('[Stats API] GET /api/dashboard/stats called');
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('[Stats API] No session or user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Stats API] User:', (session.user as any).email, 'Role:', (session.user as any).role);

    await dbConnect();

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    let stats = {
      activeJobs: 0,
      inProduction: 0,
      customers: 0,
      thisMonth: 0,
    };

    if (userRole === 'Admin') {
      // Admin dashboard stats - show ALL data
      const totalJobs = await Job.countDocuments({ deletedAt: null });
      const activeJobs = await Job.countDocuments({
        deletedAt: null,
        status: { $nin: ['Delivered', 'Cancelled'] },
      });
      const inProduction = await Job.countDocuments({
        deletedAt: null,
        status: 'In Production',
      });
      const customers = await Customer.countDocuments({ deletedAt: null });

      // Calculate "This Month" - sum of quoted amounts for jobs created this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const thisMonthJobs = await Job.aggregate([
        {
          $match: {
            deletedAt: null,
            createdDate: {
              $gte: firstDayOfMonth,
              $lte: lastDayOfMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalQuoted: { $sum: { $ifNull: ['$quotedAmount', 0] } },
          },
        },
      ]);

      const thisMonthNumber = thisMonthJobs.length > 0 ? thisMonthJobs[0].totalQuoted : 0;
      // Format as currency with commas and decimals
      const thisMonth = thisMonthNumber.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      stats = {
        activeJobs,
        inProduction,
        customers,
        thisMonth,
      };
    } else if (userRole === 'Project Manager') {
      // PM dashboard stats - show ONLY their assigned jobs
      const userObjectId = new mongoose.Types.ObjectId(userId);

      const activeJobs = await Job.countDocuments({
        deletedAt: null,
        projectManagerId: userObjectId,
        status: { $nin: ['Delivered', 'Cancelled'] },
      });

      const inProduction = await Job.countDocuments({
        deletedAt: null,
        projectManagerId: userObjectId,
        status: 'In Production',
      });

      // Get unique customers from PM's assigned jobs
      const pmJobs = await Job.find({
        deletedAt: null,
        projectManagerId: userObjectId,
      }).select('customerId');

      const uniqueCustomerIds = [
        ...new Set(pmJobs.map((job) => job.customerId.toString())),
      ];
      const customers = uniqueCustomerIds.length;

      stats = {
        activeJobs,
        inProduction,
        customers,
        thisMonth: 0,
      };
    }

    console.log('[Stats API] Returning stats:', stats);
    
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[Stats API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

