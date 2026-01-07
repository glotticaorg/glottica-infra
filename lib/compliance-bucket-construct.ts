import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Constants } from './constants';
import { Construct } from 'constructs';

interface ComplianceBucketProps {
  sox: boolean;
}

export class ComplianceBucketConstruct extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: ComplianceBucketProps) {
    super(scope, id);

    const retentionPeriod = cdk.Duration.days(props.sox ? Constants.sevenYears : Constants.year);

    this.bucket = new s3.Bucket(this, `ComplianceBucket-${id}`, {
      accessControl: s3.BucketAccessControl.LOG_DELIVERY_WRITE,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      lifecycleRules: [
        {
          expiration: retentionPeriod,
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(Constants.week),
            },
            {
              storageClass: s3.StorageClass.DEEP_ARCHIVE,
              transitionAfter: cdk.Duration.days(Constants.fourWeeks),
            },
          ],
        },
      ],
      objectLockDefaultRetention: props.sox ? {
        duration: retentionPeriod,
        mode: s3.ObjectLockMode.COMPLIANCE,
      } : undefined,
      objectLockEnabled: props.sox,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      versioned: true,
    });
  }
}
