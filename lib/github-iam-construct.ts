import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface GitHubIamConstructProps {
  awsAccountId: string;
}

export class GitHubIamConstruct extends Construct {

  constructor(scope: Construct, id: string, props: GitHubIamConstructProps) {
    super(scope, id);

    new iam.OpenIdConnectProvider(this, 'GitHubActionsOidcProvider', {
      clientIds: ['sts.amazonaws.com'],
      url: 'https://token.actions.githubusercontent.com',
    });

    const githubRole = new iam.Role(this, 'GithubActionsRole', {
      assumedBy: new iam.FederatedPrincipal(
        `arn:aws:iam::${props.awsAccountId}:oidc-provider/token.actions.githubusercontent.com`,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub': [
              'repo:glotticaorg/glottica-backend:ref:refs/heads/master',
              'repo:glotticaorg/glottica-frontend:ref:refs/heads/master',
              'repo:glotticaorg/glottica-infra:ref:refs/heads/master',
            ],
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
      description: 'Entrypoint role for GitHub actions.',
      roleName: 'github-actions-role',
    });

    githubRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
    );
  }
}
