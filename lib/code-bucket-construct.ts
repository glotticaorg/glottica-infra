import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Constants } from './constants';
import { Construct } from 'constructs';

export class CodeBucketConstruct extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, `CodeBucket-${id}`, {
      accessControl: s3.BucketAccessControl.LOG_DELIVERY_WRITE,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(Constants.year),
          transitions: [
            {
              storageClass: s3.StorageClass.GLACIER_INSTANT_RETRIEVAL,
              transitionAfter: cdk.Duration.days(Constants.fourWeeks),
            },
          ],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      versioned: true,
    });
  }
}
