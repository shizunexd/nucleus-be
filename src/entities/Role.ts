import { Unique, Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Unique('unique_name', ['name'])
    name: string;

    // Stores the string form of an array of permissions
    @Column({ type: 'text' })
    permissions: string;

    // @ManyToMany(() => User)
    // // @JoinColumn({ name: 'supplier_id', referencedColumnName: 'id' })
    // user: number;
}
