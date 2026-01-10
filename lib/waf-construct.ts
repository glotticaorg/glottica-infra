import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';

interface WafConstructProps {
  scope: 'REGIONAL' | 'CLOUDFRONT';
}

export class WafConstruct extends Construct {
  public readonly arn: string;

  constructor(scope: Construct, id: string, props: WafConstructProps) {
    super(scope, id);

    const waf = new wafv2.CfnWebACL(this, `Waf-${id}`, {
      defaultAction: {
        allow: {},
      },
      rules: [
        {
          name: 'AWS-AWSManagedRulesCommonRuleSet',
          overrideAction: {
            none: {},
          },
          priority: 0,
          statement: {
            managedRuleGroupStatement: {
              name: 'AWSManagedRulesCommonRuleSet',
              vendorName: 'AWS',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'CommonRuleSet',
            sampledRequestsEnabled: false,
          },
        },
        {
          name: 'AWS-AWSManagedRulesKnownBadInputsRuleSet',
          overrideAction: {
            none: {},
          },
          priority: 1,
          statement: {
            managedRuleGroupStatement: {
              name: 'AWSManagedRulesKnownBadInputsRuleSet',
              vendorName: 'AWS',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'KnownBadInputs',
            sampledRequestsEnabled: false,
          },
        },
        {
          name: 'AWS-AWSManagedRulesIPReputationList',
          overrideAction: {
            none: {},
          },
          priority: 2,
          statement: {
            managedRuleGroupStatement: {
              name: 'AWSManagedRulesAmazonIpReputationList',
              vendorName: 'AWS',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'IpReputationList',
            sampledRequestsEnabled: false,
          },
        },
      ],
      scope: props.scope,
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `Waf-${id}`,
        sampledRequestsEnabled: true,
      },
    });

    this.arn = waf.attrArn;
  }
}
