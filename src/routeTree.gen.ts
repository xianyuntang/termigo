/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IdentitiesIndexImport } from './routes/identities/index'
import { Route as HostsIndexImport } from './routes/hosts/index'

// Create/Update Routes

const IdentitiesIndexRoute = IdentitiesIndexImport.update({
  id: '/identities/',
  path: '/identities/',
  getParentRoute: () => rootRoute,
} as any)

const HostsIndexRoute = HostsIndexImport.update({
  id: '/hosts/',
  path: '/hosts/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/hosts/': {
      id: '/hosts/'
      path: '/hosts'
      fullPath: '/hosts'
      preLoaderRoute: typeof HostsIndexImport
      parentRoute: typeof rootRoute
    }
    '/identities/': {
      id: '/identities/'
      path: '/identities'
      fullPath: '/identities'
      preLoaderRoute: typeof IdentitiesIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/hosts': typeof HostsIndexRoute
  '/identities': typeof IdentitiesIndexRoute
}

export interface FileRoutesByTo {
  '/hosts': typeof HostsIndexRoute
  '/identities': typeof IdentitiesIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/hosts/': typeof HostsIndexRoute
  '/identities/': typeof IdentitiesIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/hosts' | '/identities'
  fileRoutesByTo: FileRoutesByTo
  to: '/hosts' | '/identities'
  id: '__root__' | '/hosts/' | '/identities/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  HostsIndexRoute: typeof HostsIndexRoute
  IdentitiesIndexRoute: typeof IdentitiesIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  HostsIndexRoute: HostsIndexRoute,
  IdentitiesIndexRoute: IdentitiesIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/hosts/",
        "/identities/"
      ]
    },
    "/hosts/": {
      "filePath": "hosts/index.tsx"
    },
    "/identities/": {
      "filePath": "identities/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */