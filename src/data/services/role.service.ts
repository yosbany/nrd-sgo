import { Role } from '../interfaces/entities.interface';
import { BaseEntity, Task } from '../interfaces/base.interface';
import { RoleRepository } from '../repositories/role.repository';

export class RoleService {
  private repository: RoleRepository;

  constructor() {
    this.repository = new RoleRepository();
  }

  async createRole(roleData: Omit<Role, keyof BaseEntity>): Promise<Role> {
    // Validate unique task names within the same frequency
    if (roleData.tasks) {
      const taskMap = new Map<string, Set<string>>();
      for (const task of roleData.tasks) {
        if (!taskMap.has(task.frequency)) {
          taskMap.set(task.frequency, new Set());
        }
        const tasks = taskMap.get(task.frequency)!;
        if (tasks.has(task.taskName)) {
          throw new Error(`Duplicate task name "${task.taskName}" for frequency "${task.frequency}"`);
        }
        tasks.add(task.taskName);
      }
    }

    const role = {
      ...roleData,
      tasks: roleData.tasks || []
    };

    return await this.repository.create(role);
  }

  async addTask(
    roleId: string,
    task: Task
  ): Promise<void> {
    const role = await this.repository.getById(roleId);
    if (!role) throw new Error('Role not found');

    // Check if task name already exists for the same frequency
    const existingTask = role.tasks.find(t => 
      t.taskName === task.taskName && t.frequency === task.frequency
    );

    if (existingTask && existingTask.taskName !== task.taskName) {
      throw new Error(`Task name "${task.taskName}" already exists for frequency "${task.frequency}"`);
    }

    await this.repository.addTask(roleId, task);
  }

  async removeTask(
    roleId: string,
    taskName: string,
    frequency: Task['frequency']
  ): Promise<void> {
    await this.repository.removeTask(roleId, taskName, frequency);
  }

  async updateRole(
    roleId: string,
    updates: Partial<Omit<Role, keyof BaseEntity>>
  ): Promise<void> {
    const role = await this.repository.getById(roleId);
    if (!role) throw new Error('Role not found');

    // If updating tasks, validate unique task names within the same frequency
    if (updates.tasks) {
      const taskMap = new Map<string, Set<string>>();
      for (const task of updates.tasks) {
        if (!taskMap.has(task.frequency)) {
          taskMap.set(task.frequency, new Set());
        }
        const tasks = taskMap.get(task.frequency)!;
        if (tasks.has(task.taskName)) {
          throw new Error(`Duplicate task name "${task.taskName}" for frequency "${task.frequency}"`);
        }
        tasks.add(task.taskName);
      }
    }

    await this.repository.update(roleId, updates);
  }

  async searchRoles(searchTerm: string): Promise<Role[]> {
    return await this.repository.searchByName(searchTerm);
  }

  async deleteRole(roleId: string): Promise<void> {
    const role = await this.repository.getById(roleId);
    if (!role) throw new Error('Role not found');

    await this.repository.delete(roleId);
  }

  async getTasksByFrequency(roleId: string, frequency: Task['frequency']): Promise<Task[]> {
    const role = await this.repository.getById(roleId);
    if (!role) throw new Error('Role not found');

    return role.tasks.filter(task => task.frequency === frequency);
  }
} 