import { FirebaseBaseRepository } from './base.repository';
import { Role } from '../interfaces/entities.interface';
import { query, where, getDocs } from 'firebase/firestore';

export class RoleRepository extends FirebaseBaseRepository<Role> {
  protected collectionName = 'roles';

  async searchByName(searchTerm: string): Promise<Role[]> {
    const q = query(
      this.collectionRef,
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async addTask(roleId: string, task: Role['tasks'][0]): Promise<void> {
    const role = await this.getById(roleId);
    if (!role) throw new Error('Role not found');

    const tasks = [...role.tasks];
    const existingTaskIndex = tasks.findIndex(t => 
      t.taskName === task.taskName && t.frequency === task.frequency
    );

    if (existingTaskIndex >= 0) {
      tasks[existingTaskIndex] = task;
    } else {
      tasks.push(task);
    }

    await this.update(roleId, { tasks });
  }

  async removeTask(roleId: string, taskName: string, frequency: string): Promise<void> {
    const role = await this.getById(roleId);
    if (!role) throw new Error('Role not found');

    const tasks = role.tasks.filter(t => 
      !(t.taskName === taskName && t.frequency === frequency)
    );

    await this.update(roleId, { tasks });
  }
} 