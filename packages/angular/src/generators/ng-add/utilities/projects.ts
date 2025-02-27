import {
  addProjectConfiguration,
  getProjects,
  readJson,
  Tree,
  writeJson,
} from '@nrwl/devkit';
import { toNewFormat, toOldFormat } from 'nx/src/adapter/angular-json';
import type { MigrationProjectConfiguration, WorkspaceProjects } from './types';

export function getAllProjects(tree: Tree): WorkspaceProjects {
  const projects = getProjects(tree);
  const result: WorkspaceProjects = {
    apps: [],
    libs: [],
  };

  for (const [name, project] of projects) {
    const migrationProject: MigrationProjectConfiguration = {
      config: project,
      name,
    };

    if (project.projectType === 'library') {
      result.libs.push(migrationProject);
    } else {
      result.apps.push(migrationProject);
    }
  }

  return result;
}

export function convertToNxProject(tree: Tree, projectName: string): void {
  const angularJson = readJson(tree, 'angular.json');
  const project = toNewFormat(angularJson).projects[projectName];
  project.name = projectName;
  addProjectConfiguration(tree, projectName, project);
  delete angularJson.projects[projectName];
  writeJson(tree, 'angular.json', { ...angularJson, version: 1 });
}

export function convertAllToNxProjects(tree: Tree): void {
  const angularJson = readJson(tree, 'angular.json');
  const projects = toNewFormat(angularJson).projects;
  for (const projectName of Object.keys(projects)) {
    projects[projectName].name = projectName;
    addProjectConfiguration(tree, projectName, projects[projectName]);
    delete angularJson.projects[projectName];
  }
  writeJson(tree, 'angular.json', { ...angularJson, version: 1 });
}
