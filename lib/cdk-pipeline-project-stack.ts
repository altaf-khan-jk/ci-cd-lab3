import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class CdkPipelineProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const helloLambda = new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: { MESSAGE: "Hello from AWS CDK Pipeline!" }
    });

    const api = new apigateway.RestApi(this, 'HelloApi', {
      restApiName: 'HelloService',
      description: 'API Gateway calling Lambda'
    });

    const hello = api.root.addResource('hello');
    hello.addMethod("GET", new apigateway.LambdaIntegration(helloLambda));

    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url ?? "" });
  }
}
