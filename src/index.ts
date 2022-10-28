import {
  AWSExternalId,
  AWSProfileName,
  AWSRoleArn,
  AWSRoleSessionName,
  CredentialedClassArgs,
} from '@elemental-clouds/hydrogen/Common';
import {
  fromIni,
  fromTemporaryCredentials,
} from '@aws-sdk/credential-providers';

import { CredentialProvider } from '@aws-sdk/types';
import assert from 'assert';

export class Credentialed {
  protected credentials?: CredentialProvider;

  /** sets the AWS credentials object from a role */
  protected usingAssumedRoleCredentials(input: {
    roleArn: AWSRoleArn;
    roleSessionName: AWSRoleSessionName;
    externalId?: AWSExternalId;
  }) {
    assert(input.roleArn, 'missing role arn');
    assert(input.roleSessionName, 'missing role session name');

    this.credentials = fromTemporaryCredentials({
      params: {
        RoleArn: input.roleArn,
        RoleSessionName: input.roleSessionName,
        ExternalId: input.externalId,
      },
    });

    return this;
  }

  /** loads the AWS credentials object from a local AWS profile */
  protected usingProfileCredentials(profileName: AWSProfileName) {
    this.credentials = fromIni({ profile: profileName });

    return this;
  }

  /**
   * setups the AWS SDK credentials when the class is instantiated
   */
  protected initCredentials(args: CredentialedClassArgs) {
    if (args.assumeRoleArn) {
      this.usingAssumedRoleCredentials({
        roleArn: args.assumeRoleArn,
        roleSessionName: args.sessionName || 'osmium',
        externalId: args.externalId,
      });
    }

    if (args.profile) {
      this.usingProfileCredentials(args.profile);
    }

    return this;
  }
}
