import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cdk from 'aws-cdk-lib/core';
import { CdnConstruct } from './cdn-construct';
import { ComplianceBucketConstruct } from './compliance-bucket-construct';
import { Construct } from 'constructs';
import { DnsConstruct } from './dns-construct';

export class CloudfrontAcmStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const rootDomain = 'glottica.org';
    const cdnDomain = 'glottica.org';

    const dns = new DnsConstruct(this, 'DnsConstruct', {
      rootDomain,
    });

    const cert = new acm.Certificate(this, 'CloudFrontCert', {
      domainName: cdnDomain,
      validation: acm.CertificateValidation.fromDns(dns.zone),
    });

    const logging = new ComplianceBucketConstruct(this, 'LoggingConstruct', {
      sox: false,
    });

    new CdnConstruct(this, 'CdnConstruct', {
      certArn: cert.certificateArn,
      domainName: cdnDomain,
      hostedZone: dns.zone,
      loggingBucket: logging.bucket,
    });
  }
}
