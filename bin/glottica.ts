#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { CloudfrontStack } from '../lib/cloudfront-stack';
import { GlotticaStack } from '../lib/glottica-stack';

const app = new cdk.App();

const CERTIFICATE_BASE_REGION = 'us-east-1';

new CloudfrontStack(app, 'CloudfrontAcmStack', {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: CERTIFICATE_BASE_REGION,
  },
});

new GlotticaStack(app, 'GlotticaStack', {
  account: process.env.AWS_ACCOUNT_ID!,
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION,
  },
});
