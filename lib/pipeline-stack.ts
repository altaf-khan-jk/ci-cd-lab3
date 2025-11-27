import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    const pipeline = new codepipeline.Pipeline(this, 'CDKPipeline', {
      pipelineName: 'CDK-Auto-Deploy', crossAccountKeys: false
    });

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new actions.CodeStarConnectionsSourceAction({
          actionName: 'GitHub',
          owner: 'altaf-khan-jk',
          repo: 'ci-cd-lab3',
          branch: 'main',
          output: sourceOutput,
          connectionArn: 'arn:aws:codeconnections:us-east-1:029448392222:connection/25eed57b-94d8-4d01-9d18-6aa1848254d5'
        })
      ]
    });

    const project = new codebuild.PipelineProject(this, 'BuildProject', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: { commands: ['npm install -g aws-cdk','npm ci'] },
          build: { commands: ['npm run build', 'cdk synth > template.yml'] }
        },
        artifacts: { 'base-directory': '.', files: ['template.yml','**/*'] }
      })
    });

    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new actions.CodeBuildAction({
          actionName: 'Synth', project, input: sourceOutput, outputs: [buildOutput]
        })
      ]
    });

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        new actions.CloudFormationCreateUpdateStackAction({
          actionName: 'CFN_Deploy',
          templatePath: buildOutput.atPath('template.yml'),
          stackName: 'CDK-Application-Stack',
          adminPermissions: true
        })
      ]
    });
  }
}
