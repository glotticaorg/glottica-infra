#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { CloudfrontAcmStack } from '../lib/cloudfront-acm-stack';
import { GlotticaStack } from '../lib/glottica-stack';

const app = new cdk.App();

const certificateBaseRegion = 'us-east-1';

new CloudfrontAcmStack(app, 'CloudfrontAcmStack', {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: certificateBaseRegion,
  },
});

new GlotticaStack(app, 'GlotticaStack', {
  account: process.env.AWS_ACCOUNT_ID!,
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION,
  },
  githubRepo: process.env.GITHUB_REPOSITORY!,
});
