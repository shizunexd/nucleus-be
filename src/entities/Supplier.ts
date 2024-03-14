import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { IsString } from 'class-validator';
@Entity()
export class Supplier {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsString()
    name: string;

    @Column()
    @IsString()
    description: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP', select: false })
    created: Date;

    @Column({ default: () => 'CURRENT_TIMESTAMP', select: false })
    updated: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    last_updated_by: string;

    @Column({ nullable: true })
    @IsString()
    address: string;

    @Column({ nullable: true })
    @IsString()
    phone: string;

    @Column({ nullable: true })
    @IsString()
    logo_url: string;
}
