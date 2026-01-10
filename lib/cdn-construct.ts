import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cdk from 'aws-cdk-lib'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { WafConstruct } from './waf-construct';

interface CdnConstructProps {
  hostedZone: route53.IHostedZone;
  loggingBucket: s3.Bucket;
  domainName: string;
  certArn: string;
}

export class CdnConstruct extends Construct {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: CdnConstructProps) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, 'WebsiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      serverAccessLogsBucket: props.loggingBucket,
      serverAccessLogsPrefix: 's3-logs/',
    });

    const cert = acm.Certificate.fromCertificateArn(this, 'CloudFrontCert', props.certArn);

    const oac = new cloudfront.S3OriginAccessControl(this, 'OAC', {
      signing: {
        behavior: cloudfront.SigningBehavior.ALWAYS,
        protocol: cloudfront.SigningProtocol.SIGV4,
      },
    });

    const waf = new WafConstruct(this, 'CdnWaf', {
      scope: 'CLOUDFRONT',
    });

    this.distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
      certificate: cert,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.bucket, {
          originAccessControlId: oac.originAccessControlId,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      domainNames: [
        props.domainName,
      ],
      enableLogging: true,
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/error/index.html',
        },
      ],
      logBucket: props.loggingBucket,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      webAclId: waf.arn,
    });

    if (!props.domainName.endsWith(props.hostedZone.zoneName)) {
      throw new Error(`CloudFront domain ${props.domainName} is not compatible with hosted zone at ${props.hostedZone.zoneName}.`);
    }
    const sliceEnd = Math.max(props.domainName.length - props.hostedZone.zoneName.length - 1, 0);
    const processedDomainName = props.domainName.slice(0, sliceEnd);

    const cloudfrontRoutingAlias = new route53Targets.CloudFrontTarget(this.distribution);

    new route53.ARecord(this, 'WebsiteARecord', {
      recordName: processedDomainName,
      target: route53.RecordTarget.fromAlias(cloudfrontRoutingAlias),
      zone: props.hostedZone,
    });

    new route53.AaaaRecord(this, 'WebsiteAaaaRecord', {
      recordName: processedDomainName,
      target: route53.RecordTarget.fromAlias(cloudfrontRoutingAlias),
      zone: props.hostedZone,
    });
  }
}
