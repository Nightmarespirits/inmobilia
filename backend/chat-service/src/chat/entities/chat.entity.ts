import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Message } from './message.entity';

export enum ChatType {
  DIRECT = 'direct',
  GROUP = 'group',
  PROPERTY_INQUIRY = 'property_inquiry',
}

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ChatType,
    default: ChatType.DIRECT,
  })
  type: ChatType;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('uuid', { array: true })
  participants: string[];

  @Column('uuid', { nullable: true })
  propertyId: string;

  @Column('uuid', { nullable: true })
  agentId: string;

  @Column('uuid', { nullable: true })
  clientId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastMessageAt: Date;

  @Column({ nullable: true })
  lastMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Message, message => message.chat)
  messages: Message[];
}
