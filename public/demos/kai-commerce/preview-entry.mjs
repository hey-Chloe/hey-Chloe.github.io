import { createDemoWorkbenchApi } from './demo-adapter.mjs';
import { mountCommerceWorkbench } from './workbench.mjs';

mountCommerceWorkbench(
  document.querySelector('#kai-commercial-workbench'),
  { api: createDemoWorkbenchApi(), pollIntervalMs: 100 }
);

