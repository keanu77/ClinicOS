import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.inventoryTxn.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.handoverComment.deleteMany();
  await prisma.handover.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@clinic.local',
      name: '系統管理員',
      role: 'ADMIN',
      passwordHash: hashedPassword,
    },
  });

  const supervisor = await prisma.user.create({
    data: {
      email: 'supervisor@clinic.local',
      name: '王主管',
      role: 'SUPERVISOR',
      passwordHash: hashedPassword,
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      email: 'staff1@clinic.local',
      name: '李護理師',
      role: 'STAFF',
      passwordHash: hashedPassword,
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      email: 'staff2@clinic.local',
      name: '陳護理師',
      role: 'STAFF',
      passwordHash: hashedPassword,
    },
  });

  console.log('👥 Created users');

  // Create inventory items
  const items = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        name: '生理食鹽水',
        sku: 'MED-001',
        unit: '瓶',
        quantity: 100,
        minStock: 20,
        location: 'A-1-1',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: '酒精棉片',
        sku: 'MED-002',
        unit: '盒',
        quantity: 50,
        minStock: 10,
        location: 'A-1-2',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: '注射針筒 5ml',
        sku: 'MED-003',
        unit: '支',
        quantity: 200,
        minStock: 50,
        location: 'A-2-1',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: '紗布',
        sku: 'MED-004',
        unit: '包',
        quantity: 80,
        minStock: 15,
        location: 'A-2-2',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: '手套 (M)',
        sku: 'MED-005',
        unit: '盒',
        quantity: 30,
        minStock: 10,
        location: 'B-1-1',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: '手套 (L)',
        sku: 'MED-006',
        unit: '盒',
        quantity: 25,
        minStock: 10,
        location: 'B-1-2',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: '繃帶',
        sku: 'MED-007',
        unit: '卷',
        quantity: 60,
        minStock: 20,
        location: 'B-2-1',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: '優碘',
        sku: 'MED-008',
        unit: '瓶',
        quantity: 15,
        minStock: 5,
        location: 'B-2-2',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: '體溫計套',
        sku: 'MED-009',
        unit: '盒',
        quantity: 8,
        minStock: 10,
        location: 'C-1-1',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: '口罩',
        sku: 'MED-010',
        unit: '盒',
        quantity: 5,
        minStock: 20,
        location: 'C-1-2',
      },
    }),
  ]);

  console.log('📦 Created inventory items');

  // Create inventory transactions
  await Promise.all([
    prisma.inventoryTxn.create({
      data: {
        type: 'IN',
        quantity: 100,
        note: '初始入庫',
        itemId: items[0].id,
        performedById: admin.id,
      },
    }),
    prisma.inventoryTxn.create({
      data: {
        type: 'OUT',
        quantity: -10,
        note: '日常使用',
        itemId: items[0].id,
        performedById: staff1.id,
      },
    }),
    prisma.inventoryTxn.create({
      data: {
        type: 'IN',
        quantity: 50,
        note: '補貨',
        itemId: items[1].id,
        performedById: admin.id,
      },
    }),
  ]);

  console.log('📝 Created inventory transactions');

  // Create shifts for this week
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const shifts = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    // Morning shifts
    shifts.push(
      prisma.shift.create({
        data: {
          date,
          type: 'MORNING',
          userId: i % 2 === 0 ? staff1.id : staff2.id,
        },
      })
    );

    // Afternoon shifts
    shifts.push(
      prisma.shift.create({
        data: {
          date,
          type: 'AFTERNOON',
          userId: i % 2 === 0 ? staff2.id : staff1.id,
        },
      })
    );
  }

  await Promise.all(shifts);
  console.log('📅 Created shifts');

  // Create handovers
  const handover1 = await prisma.handover.create({
    data: {
      title: '病患王先生需追蹤血壓',
      content:
        '王先生（床號 A-101）今日血壓偏高 160/95，需每 4 小時測量一次並記錄。若持續偏高請通知主治醫師。',
      status: 'PENDING',
      priority: 'HIGH',
      createdById: staff1.id,
      assigneeId: staff2.id,
    },
  });

  const handover2 = await prisma.handover.create({
    data: {
      title: '藥品庫存補充提醒',
      content: '生理食鹽水庫存偏低，需於本週內補貨。已聯繫供應商，預計週三到貨。',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      createdById: supervisor.id,
      assigneeId: admin.id,
    },
  });

  const handover3 = await prisma.handover.create({
    data: {
      title: '新進人員訓練安排',
      content: '下週一有新進護理師報到，需安排基礎訓練與環境介紹。請主管確認訓練流程。',
      status: 'PENDING',
      priority: 'LOW',
      createdById: staff1.id,
    },
  });

  const handover4 = await prisma.handover.create({
    data: {
      title: '緊急設備維修',
      content: '3 號診間的血壓計故障，已通報設備科。在維修完成前請使用備用設備。',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      createdById: staff2.id,
      assigneeId: supervisor.id,
    },
  });

  const handover5 = await prisma.handover.create({
    data: {
      title: '病歷系統維護通知',
      content: '本週六凌晨 2:00-4:00 進行病歷系統維護，屆時系統將暫停服務。請提前完成文書作業。',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      createdById: admin.id,
      completedAt: new Date(),
    },
  });

  console.log('📋 Created handovers');

  // Create handover comments
  await prisma.handoverComment.create({
    data: {
      content: '已確認，會持續追蹤病患狀況。',
      handoverId: handover1.id,
      authorId: staff2.id,
    },
  });

  await prisma.handoverComment.create({
    data: {
      content: '供應商已確認週三可送達。',
      handoverId: handover2.id,
      authorId: admin.id,
    },
  });

  await prisma.handoverComment.create({
    data: {
      content: '設備科回覆預計明天下午可修復完成。',
      handoverId: handover4.id,
      authorId: supervisor.id,
    },
  });

  console.log('💬 Created handover comments');

  // Create notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        type: 'HANDOVER_ASSIGNED',
        title: '新交班指派',
        message: '您有一項新的交班事項：病患王先生需追蹤血壓',
        userId: staff2.id,
        metadata: JSON.stringify({ handoverId: handover1.id }),
      },
    }),
    prisma.notification.create({
      data: {
        type: 'INVENTORY_LOW_STOCK',
        title: '低庫存警示',
        message: '口罩庫存低於安全存量，目前庫存：5 盒，最低存量：20 盒',
        userId: admin.id,
        metadata: JSON.stringify({ itemId: items[9].id }),
      },
    }),
    prisma.notification.create({
      data: {
        type: 'INVENTORY_LOW_STOCK',
        title: '低庫存警示',
        message: '體溫計套庫存低於安全存量，目前庫存：8 盒，最低存量：10 盒',
        userId: admin.id,
        metadata: JSON.stringify({ itemId: items[8].id }),
      },
    }),
  ]);

  console.log('🔔 Created notifications');

  // Create audit logs
  await Promise.all([
    prisma.auditLog.create({
      data: {
        action: 'AUTH_LOGIN',
        userId: admin.id,
        metadata: JSON.stringify({ success: true }),
      },
    }),
    prisma.auditLog.create({
      data: {
        action: 'HANDOVER_CREATE',
        targetId: handover1.id,
        targetType: 'Handover',
        userId: staff1.id,
        metadata: JSON.stringify({ title: handover1.title }),
      },
    }),
    prisma.auditLog.create({
      data: {
        action: 'INVENTORY_UPDATE',
        targetId: items[0].id,
        targetType: 'InventoryItem',
        userId: staff1.id,
        metadata: JSON.stringify({ type: 'OUT', quantity: -10 }),
      },
    }),
  ]);

  console.log('📜 Created audit logs');

  console.log('✅ Seed completed successfully!');
  console.log('\n📧 Test accounts:');
  console.log('   admin@clinic.local / password123 (ADMIN)');
  console.log('   supervisor@clinic.local / password123 (SUPERVISOR)');
  console.log('   staff1@clinic.local / password123 (STAFF)');
  console.log('   staff2@clinic.local / password123 (STAFF)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
