import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { UserRole, UserStatus, DepartmentStatus, CategoryStatus, AssetStatus, AssetCondition, CustomFieldType } from '../config/constants.js';
import { User } from '../modules/users/user.model.js';
import { Department } from '../modules/departments/department.model.js';
import { Category } from '../modules/categories/category.model.js';
import { Asset } from '../modules/assets/asset.model.js';

dotenv.config();

const seed = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/assetflow';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Category.deleteMany({});
    await Asset.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create Departments
    const deptIT = new Department({
      name: 'Information Technology',
      code: 'IT',
      status: DepartmentStatus.ACTIVE,
    });
    const deptHR = new Department({
      name: 'Human Resources',
      code: 'HR',
      status: DepartmentStatus.ACTIVE,
    });
    await deptIT.save();
    await deptHR.save();
    console.log('🏢 Departments created');

    // Create Users
    const password = await bcrypt.hash('Admin@123', 12);
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@assetflow.com',
      password,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    const managerPassword = await bcrypt.hash('Manager@1', 12);
    const manager = new User({
      firstName: 'Asset',
      lastName: 'Manager',
      email: 'manager@assetflow.com',
      password: managerPassword,
      role: UserRole.ASSET_MANAGER,
      departmentId: deptIT._id,
      status: UserStatus.ACTIVE,
    });
    
    const deptHeadPassword = await bcrypt.hash('DeptHead@1', 12);
    const deptHead = new User({
      firstName: 'Dept',
      lastName: 'Head',
      email: 'depthead@assetflow.com',
      password: deptHeadPassword,
      role: UserRole.DEPARTMENT_HEAD,
      departmentId: deptIT._id,
      status: UserStatus.ACTIVE,
    });

    const employeePassword = await bcrypt.hash('Employee@1', 12);
    const employee = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'employee@assetflow.com',
      password: employeePassword,
      role: UserRole.EMPLOYEE,
      departmentId: deptHR._id,
      status: UserStatus.ACTIVE,
    });

    await admin.save();
    await manager.save();
    await deptHead.save();
    await employee.save();
    
    deptIT.headId = deptHead._id as any;
    await deptIT.save();
    console.log('👥 Users created');

    // Create Categories
    const catLaptop = new Category({
      name: 'Laptops',
      description: 'Company laptops',
      status: CategoryStatus.ACTIVE,
      customFields: [
        { name: 'RAM', fieldType: CustomFieldType.TEXT, required: true },
        { name: 'Storage', fieldType: CustomFieldType.TEXT, required: true }
      ]
    });
    await catLaptop.save();
    console.log('📁 Categories created');

    // Create Assets
    const asset1 = new Asset({
      assetTag: 'AST-00001',
      name: 'MacBook Pro 16"',
      categoryId: catLaptop._id,
      departmentId: deptIT._id,
      status: AssetStatus.AVAILABLE,
      condition: AssetCondition.NEW,
      serialNumber: 'C02ABCDEFGH',
    });
    await asset1.save();
    console.log('💻 Assets created');

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
