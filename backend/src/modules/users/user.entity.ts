import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '../../common/roles';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'text' })
  email!: string;

  @Column({ type: 'text', name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'text', name: 'first_name' })
  firstName!: string;

  @Column({ type: 'text', name: 'last_name' })
  lastName!: string;

  @Column({ type: 'text', name: 'role_code' })
  role!: Role;

  @Column({ type: 'uuid', name: 'company_id', nullable: true })
  companyId!: string | null;

  @Column({ type: 'text', nullable: true })
  curp!: string | null;

  @Column({ type: 'text', default: 'es' })
  locale!: string;

  @Column({ type: 'text', nullable: true, unique: true })
  username!: string | null;

  @Column({ type: 'text', nullable: true })
  phone!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ type: 'text', nullable: true })
  city!: string | null;

  @Column({ type: 'text', nullable: true })
  state!: string | null;

  @Column({ type: 'text', nullable: true })
  zip!: string | null;

  @Column({ type: 'text', nullable: true, default: 'America/Mexico_City' })
  timezone!: string | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', name: 'must_change_password', default: false })
  mustChangePassword!: boolean;

  @Column({ type: 'timestamptz', name: 'last_login_at', nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
