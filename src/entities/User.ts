import { JoinTable, ManyToOne, ManyToMany, JoinColumn, Unique, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from './Role';

@Entity()
@Unique('unique_username', ['username'])
@Unique('unique_email', ['email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({ nullable: true })
    email: string;

    @Column()
    password: string;

    @ManyToMany(() => Role)
    @JoinTable()
    role: Role[];
}
