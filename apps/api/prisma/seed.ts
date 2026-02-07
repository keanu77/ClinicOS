import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (in reverse order of dependencies)
  // Permission
  await prisma.permissionRequest.deleteMany();
  await prisma.userPermission.deleteMany();
  // Finance
  await prisma.costSnapshot.deleteMany();
  await prisma.revenueEntry.deleteMany();
  await prisma.costEntry.deleteMany();
  await prisma.costCategory.deleteMany();
  // Documents
  await prisma.announcementReadConfirmation.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.documentReadConfirmation.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.documentCategory.deleteMany();
  // Quality
  await prisma.incidentFollowUp.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.incidentType.deleteMany();
  await prisma.complaint.deleteMany();
  // Procurement
  await prisma.goodsReceipt.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.purchaseRequestItem.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.vendor.deleteMany();
  // Assets
  await prisma.assetUsageRecord.deleteMany();
  await prisma.faultReport.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.maintenanceSchedule.deleteMany();
  await prisma.asset.deleteMany();
  // HR
  await prisma.leaveRecord.deleteMany();
  await prisma.employeeSkill.deleteMany();
  await prisma.skillDefinition.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.employeeProfile.deleteMany();
  // Tasks
  await prisma.taskChecklist.deleteMany();
  await prisma.taskCollaborator.deleteMany();
  await prisma.taskCategory.deleteMany();
  // Core
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
      position: 'ADMIN',
      passwordHash: hashedPassword,
    },
  });

  const supervisor = await prisma.user.create({
    data: {
      email: 'supervisor@clinic.local',
      name: '王經理',
      role: 'SUPERVISOR',
      position: 'MANAGER',
      passwordHash: hashedPassword,
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      email: 'staff1@clinic.local',
      name: '李護理師',
      role: 'STAFF',
      position: 'NURSE',
      passwordHash: hashedPassword,
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      email: 'staff2@clinic.local',
      name: '陳護理師',
      role: 'STAFF',
      position: 'NURSE',
      passwordHash: hashedPassword,
    },
  });

  // 新增更多測試使用者以涵蓋不同職位
  const doctor = await prisma.user.create({
    data: {
      email: 'doctor@clinic.local',
      name: '林醫師',
      role: 'STAFF',
      position: 'DOCTOR',
      passwordHash: hashedPassword,
    },
  });

  const therapist = await prisma.user.create({
    data: {
      email: 'therapist@clinic.local',
      name: '張運醫老師',
      role: 'STAFF',
      position: 'SPORTS_THERAPIST',
      passwordHash: hashedPassword,
    },
  });

  const receptionist = await prisma.user.create({
    data: {
      email: 'receptionist@clinic.local',
      name: '周櫃檯',
      role: 'STAFF',
      position: 'RECEPTIONIST',
      passwordHash: hashedPassword,
    },
  });

  console.log('👥 Created users');

  // Create employee profiles
  await Promise.all([
    prisma.employeeProfile.create({
      data: {
        userId: staff1.id,
        employeeNo: 'EMP-001',
        department: '護理部',
        position: '護理師',
        hireDate: new Date('2023-01-15'),
        phone: '0912-345-678',
        emergencyContact: '李媽媽 0923-456-789',
      },
    }),
    prisma.employeeProfile.create({
      data: {
        userId: staff2.id,
        employeeNo: 'EMP-002',
        department: '護理部',
        position: '護理師',
        hireDate: new Date('2023-06-01'),
        phone: '0922-333-444',
        emergencyContact: '陳爸爸 0933-222-111',
      },
    }),
    prisma.employeeProfile.create({
      data: {
        userId: supervisor.id,
        employeeNo: 'EMP-003',
        department: '護理部',
        position: '護理長',
        hireDate: new Date('2020-03-01'),
        phone: '0933-111-222',
      },
    }),
  ]);

  console.log('👤 Created employee profiles');

  // Create skill definitions
  const skills = await Promise.all([
    prisma.skillDefinition.create({
      data: {
        name: '靜脈注射',
        description: '具備靜脈穿刺與輸液技術',
        category: '臨床技能',
      },
    }),
    prisma.skillDefinition.create({
      data: {
        name: '傷口護理',
        description: '傷口清潔、換藥與評估',
        category: '臨床技能',
      },
    }),
    prisma.skillDefinition.create({
      data: {
        name: '心電圖判讀',
        description: '基本心電圖判讀能力',
        category: '診斷技能',
      },
    }),
    prisma.skillDefinition.create({
      data: {
        name: 'BLS 急救',
        description: '基本生命救援術',
        category: '急救技能',
      },
    }),
  ]);

  // Assign skills to employees
  await Promise.all([
    prisma.employeeSkill.create({
      data: {
        userId: staff1.id,
        skillId: skills[0].id,
        level: 'ADVANCED',
        certifiedAt: new Date('2023-06-01'),
      },
    }),
    prisma.employeeSkill.create({
      data: {
        userId: staff1.id,
        skillId: skills[1].id,
        level: 'INTERMEDIATE',
        certifiedAt: new Date('2023-06-01'),
      },
    }),
    prisma.employeeSkill.create({
      data: {
        userId: staff2.id,
        skillId: skills[0].id,
        level: 'INTERMEDIATE',
        certifiedAt: new Date('2023-08-01'),
      },
    }),
    prisma.employeeSkill.create({
      data: {
        userId: staff2.id,
        skillId: skills[3].id,
        level: 'CERTIFIED',
        certifiedAt: new Date('2023-07-01'),
      },
    }),
  ]);

  console.log('🎯 Created skills');

  // Create certifications
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const inThreeMonths = new Date();
  inThreeMonths.setMonth(inThreeMonths.getMonth() + 3);

  await Promise.all([
    prisma.certification.create({
      data: {
        userId: staff1.id,
        name: '護理師執照',
        issuingOrg: '衛生福利部',
        certNo: 'RN-2023-001234',
        issueDate: new Date('2023-01-01'),
        expiryDate: nextYear,
        status: 'VALID',
      },
    }),
    prisma.certification.create({
      data: {
        userId: staff2.id,
        name: '護理師執照',
        issuingOrg: '衛生福利部',
        certNo: 'RN-2023-002345',
        issueDate: new Date('2023-06-01'),
        expiryDate: nextYear,
        status: 'VALID',
      },
    }),
    prisma.certification.create({
      data: {
        userId: staff1.id,
        name: 'BLS 證照',
        issuingOrg: '急救教育推廣中心',
        certNo: 'BLS-2024-0001',
        issueDate: new Date('2024-01-15'),
        expiryDate: inThreeMonths,
        status: 'EXPIRING_SOON',
      },
    }),
  ]);

  console.log('📜 Created certifications');

  // Create task categories
  const taskCategories = await Promise.all([
    prisma.taskCategory.create({
      data: { name: '行政', color: '#3B82F6', icon: 'FileText' },
    }),
    prisma.taskCategory.create({
      data: { name: '人資', color: '#8B5CF6', icon: 'Users' },
    }),
    prisma.taskCategory.create({
      data: { name: '設備', color: '#F59E0B', icon: 'Wrench' },
    }),
    prisma.taskCategory.create({
      data: { name: '醫療品質', color: '#EF4444', icon: 'Shield' },
    }),
  ]);

  console.log('🏷️ Created task categories');

  // Create assets
  const assets = await Promise.all([
    prisma.asset.create({
      data: {
        assetNo: 'EQ-001',
        name: '血壓計',
        category: '醫療設備',
        model: 'Omron HEM-7600T',
        serialNo: 'SN-2023-001',
        location: '1 號診間',
        status: 'IN_USE',
        condition: 'GOOD',
        purchaseDate: new Date('2023-01-15'),
        purchaseCost: 3500,
        warrantyEnd: new Date('2026-01-15'),
      },
    }),
    prisma.asset.create({
      data: {
        assetNo: 'EQ-002',
        name: '血壓計',
        category: '醫療設備',
        model: 'Omron HEM-7600T',
        serialNo: 'SN-2023-002',
        location: '2 號診間',
        status: 'IN_USE',
        condition: 'GOOD',
        purchaseDate: new Date('2023-01-15'),
        purchaseCost: 3500,
        warrantyEnd: new Date('2026-01-15'),
      },
    }),
    prisma.asset.create({
      data: {
        assetNo: 'EQ-003',
        name: '血壓計',
        category: '醫療設備',
        model: 'Omron HEM-7600T',
        serialNo: 'SN-2023-003',
        location: '3 號診間',
        status: 'MAINTENANCE',
        condition: 'FAIR',
        purchaseDate: new Date('2023-01-15'),
        purchaseCost: 3500,
        warrantyEnd: new Date('2026-01-15'),
      },
    }),
    prisma.asset.create({
      data: {
        assetNo: 'EQ-004',
        name: '超音波機',
        category: '醫療設備',
        model: 'GE LOGIQ E10',
        serialNo: 'SN-2022-100',
        location: '超音波室',
        status: 'IN_USE',
        condition: 'EXCELLENT',
        purchaseDate: new Date('2022-06-01'),
        purchaseCost: 1500000,
        warrantyEnd: new Date('2025-06-01'),
      },
    }),
  ]);

  // Create maintenance schedules
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await Promise.all([
    prisma.maintenanceSchedule.create({
      data: {
        assetId: assets[3].id,
        name: '超音波機定期保養',
        frequency: 'MONTHLY',
        frequencyDays: 30,
        description: '超音波機定期保養與校正',
        nextDueAt: nextMonth,
      },
    }),
  ]);

  console.log('🔧 Created assets and maintenance schedules');

  // Create vendors
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: {
        name: '醫療器材供應商',
        code: 'V001',
        contactName: '張經理',
        phone: '02-2345-6789',
        email: 'zhang@medical-supply.com',
        address: '台北市中山區醫療街 100 號',
      },
    }),
    prisma.vendor.create({
      data: {
        name: '耗材批發商',
        code: 'V002',
        contactName: '林小姐',
        phone: '02-8765-4321',
        email: 'lin@consumables.com',
        address: '新北市板橋區物流路 50 號',
      },
    }),
  ]);

  console.log('🏪 Created vendors');

  // Create incident types
  const incidentTypes = await Promise.all([
    prisma.incidentType.create({
      data: {
        name: '用藥錯誤',
        description: '給藥劑量、時間或對象錯誤',
        category: '醫療安全',
        severity: 'HIGH',
      },
    }),
    prisma.incidentType.create({
      data: {
        name: '跌倒',
        description: '病患或訪客跌倒事件',
        category: '環境安全',
        severity: 'MEDIUM',
      },
    }),
    prisma.incidentType.create({
      data: {
        name: '針扎',
        description: '醫護人員遭針頭刺傷',
        category: '職業安全',
        severity: 'HIGH',
      },
    }),
    prisma.incidentType.create({
      data: {
        name: '設備故障',
        description: '醫療設備故障影響作業',
        category: '設備安全',
        severity: 'LOW',
      },
    }),
  ]);

  console.log('⚠️ Created incident types');

  // Create document categories
  const docCategories = await Promise.all([
    prisma.documentCategory.create({
      data: {
        name: '標準作業程序 (SOP)',
        description: '各項作業標準流程',
        sortOrder: 1,
      },
    }),
    prisma.documentCategory.create({
      data: {
        name: '政策規章',
        description: '診所政策與規章制度',
        sortOrder: 2,
      },
    }),
    prisma.documentCategory.create({
      data: {
        name: '教育訓練',
        description: '員工教育訓練資料',
        sortOrder: 3,
      },
    }),
  ]);

  console.log('📚 Created document categories');

  // Create cost categories
  const costCategories = await Promise.all([
    prisma.costCategory.create({
      data: {
        name: '人事成本',
        description: '薪資、獎金、保險',
        type: 'FIXED',
      },
    }),
    prisma.costCategory.create({
      data: {
        name: '房租水電',
        description: '場地租金與水電瓦斯',
        type: 'FIXED',
      },
    }),
    prisma.costCategory.create({
      data: {
        name: '醫療耗材',
        description: '診療用耗材',
        type: 'VARIABLE',
      },
    }),
    prisma.costCategory.create({
      data: {
        name: '設備維護',
        description: '設備保養與維修',
        type: 'VARIABLE',
      },
    }),
  ]);

  console.log('💰 Created cost categories');

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
  console.log('   admin@clinic.local / password123 (管理者)');
  console.log('   supervisor@clinic.local / password123 (經理)');
  console.log('   staff1@clinic.local / password123 (護理師)');
  console.log('   staff2@clinic.local / password123 (護理師)');
  console.log('   doctor@clinic.local / password123 (醫師)');
  console.log('   therapist@clinic.local / password123 (運醫老師)');
  console.log('   receptionist@clinic.local / password123 (櫃檯)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
