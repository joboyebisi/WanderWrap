import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
  CognitoIdentityProviderClient,
  CreateManagedLoginBrandingCommand,
  DescribeManagedLoginBrandingByClientCommand,
  UpdateManagedLoginBrandingCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { fromSSO } from '@aws-sdk/credential-provider-sso';

const args = new Map(process.argv.slice(2).map(value => {
  const [key, ...rest] = value.split('=');
  return [key, rest.join('=') || true];
}));
const apply = args.has('--apply');
const defaults = args.has('--defaults');
const describe = args.has('--describe');
const region = String(args.get('--region') || 'eu-west-2');
const profile = args.get('--profile') ? String(args.get('--profile')) : undefined;
const userPoolId = String(args.get('--user-pool-id') || '');
const clientId = String(args.get('--client-id') || '');
if (!userPoolId || !clientId) throw new Error('Pass --user-pool-id=<id> and --client-id=<id>.');

const root = fileURLToPath(new URL('..', import.meta.url));
const settings = JSON.parse(await readFile(new URL('../infrastructure/cognito-managed-login-branding.json', import.meta.url), 'utf8'));
const emblem = await readFile(new URL('../apps/web/public/landing/wanderwrap-emblem.png', import.meta.url));
const assets = [{ Category: 'FORM_LOGO', ColorMode: 'LIGHT', Extension: 'PNG', Bytes: emblem }];
const client = new CognitoIdentityProviderClient({ region, ...(profile ? { credentials: fromSSO({ profile }) } : {}) });

let current;
try {
  current = (await client.send(new DescribeManagedLoginBrandingByClientCommand({ UserPoolId: userPoolId, ClientId: clientId, ReturnMergedResources: false }))).ManagedLoginBranding;
} catch (error) {
  if (error?.name !== 'ResourceNotFoundException') throw error;
}

if (!apply) {
  if (defaults && !current) {
    current = (await client.send(new CreateManagedLoginBrandingCommand({ UserPoolId: userPoolId, ClientId: clientId, UseCognitoProvidedValues: true }))).ManagedLoginBranding;
  }
  if (describe) {
    const merged = (await client.send(new DescribeManagedLoginBrandingByClientCommand({ UserPoolId: userPoolId, ClientId: clientId, ReturnMergedResources: true }))).ManagedLoginBranding;
    console.log(JSON.stringify({ settings: merged?.Settings, assets: (merged?.Assets || []).map(asset => ({ Category: asset.Category, ColorMode: asset.ColorMode, Extension: asset.Extension })) }, null, 2));
    process.exit(0);
  }
  console.log(JSON.stringify({ mode: current ? 'update' : 'create', apply: false, region, hasExistingStyle: Boolean(current), settingsFile: `${root}infrastructure/cognito-managed-login-branding.json`, assetBytes: emblem.length }, null, 2));
  process.exit(0);
}

if (current?.ManagedLoginBrandingId) {
  await client.send(new UpdateManagedLoginBrandingCommand({
    UserPoolId: userPoolId,
    ManagedLoginBrandingId: current.ManagedLoginBrandingId,
    Settings: settings,
    Assets: assets
  }));
} else {
  await client.send(new CreateManagedLoginBrandingCommand({ UserPoolId: userPoolId, ClientId: clientId, Settings: settings, Assets: assets }));
}

const verified = (await client.send(new DescribeManagedLoginBrandingByClientCommand({ UserPoolId: userPoolId, ClientId: clientId, ReturnMergedResources: false }))).ManagedLoginBranding;
console.log(JSON.stringify({ applied: true, brandingId: verified?.ManagedLoginBrandingId, hasSettings: Boolean(verified?.Settings), assetCategories: (verified?.Assets || []).map(asset => asset.Category) }, null, 2));
