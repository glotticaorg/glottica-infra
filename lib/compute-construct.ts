import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3'
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import * as ssm from 'aws-cdk-lib/aws-ssm'
import { Construct } from 'constructs';

interface ComputeConstructProps {
  table: dynamodb.ITable;
  codeBucket: s3.IBucket;
}

export class ComputeConstruct extends Construct {
  public readonly apiLambda: lambda.Function;

  constructor(scope: Construct, id: string, props: ComputeConstructProps) {
    super(scope, id);

    /* eslint-disable capitalized-comments */
    // const objectVersion = ssm.StringParameter.valueForStringParameter(
    //   this,
    //   '/glotticaorg/api/lambda-version'
    // );

    this.apiLambda = new lambda.Function(this, 'ApiLambda', {
      architecture: lambda.Architecture.ARM_64,
      code: lambda.Code.fromInline('export const handler = async () => ({ statusCode: 200, body: \'\' });'),
      // code: lambda.Code.fromBucketV2(props.codeBucket, 'apiLambdaCode/handler.zip', {
      //  objectVersion,
      // }),
      /* eslint-enable capitalized-comments */
      environment: {
        TABLE_NAME: props.table.tableName,
      },
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_24_X,
    });

    props.table.grantReadWriteData(this.apiLambda);
  }
}
