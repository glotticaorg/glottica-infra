import * as cdk from 'aws-cdk-lib/core';
import * as glottica from '../lib/glottica-stack';
import { Template } from 'aws-cdk-lib/assertions';

test('Hosted zone created', () => {
  const app = new cdk.App();
  const stack = new glottica.GlotticaStack(app, 'MyTestStack', {
    account: '123412341234',
    githubRepo: 'torvalds/linux',
  });
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::Route53::HostedZone', {
    Name: 'glottica.org.',
  });
});
