import * as cdk from 'aws-cdk-lib/core';
import { ApiRoutingConstruct } from './api-routing-construct';
import { CodeBucketConstruct } from './code-bucket-construct';
import { ComplianceBucketConstruct } from './compliance-bucket-construct';
import { ComputeConstruct } from './compute-construct';
import { Construct } from 'constructs';
import { DnsConstruct } from './dns-construct';
import { GitHubIamConstruct } from './github-iam-construct';
import { TableConstruct } from './table-construct';
import { TrailConstruct } from './trail-construct';

export class GlotticaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    new GitHubIamConstruct(this, 'GitHubIamConstruct', {
      awsAccountId: props.env!.account!,
    });

    const rootDomain = 'glottica.org';
    const apiDomain = 'api.'.concat(rootDomain);

    const dns = new DnsConstruct(this, 'DnsConstruct', {
      rootDomain,
    });

    const trailBucket = new ComplianceBucketConstruct(this, 'TrailBucketConstruct', {
      sox: false,
    });
    const lambdaCode = new CodeBucketConstruct(this, 'CodeBucketConstruct');

    new TrailConstruct(this, 'TrailConstruct', {
      putEvents: [lambdaCode.bucket],
      trailBucket: trailBucket.bucket,
    });

    const table = new TableConstruct(this, 'TableConstruct');

    const compute = new ComputeConstruct(this, 'ComputeConstruct', {
      codeBucket: lambdaCode.bucket,
      table: table.table,
    });

    new ApiRoutingConstruct(this, 'ApiRoutingConstruct', {
      domainName: apiDomain,
      hostedZone: dns.zone,
      lambda: compute.apiLambda,
    });
  }
}
