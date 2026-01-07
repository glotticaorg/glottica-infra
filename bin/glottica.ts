#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { CloudfrontAcmStack } from '../lib/cloudfront-acm-stack';
import { GlotticaStack } from '../lib/glottica-stack';

const app = new cdk.App();

const cfStack = new CloudfrontAcmStack(app, 'CloudfrontAcmStack', {
  crossRegionReferences: true,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
});

new GlotticaStack(app, 'GlotticaStack', {
  cloudFrontCert: cfStack.arn,
  crossRegionReferences: true,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-west-1',
  },
});
