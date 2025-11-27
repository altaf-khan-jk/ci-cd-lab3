#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkPipelineProjectStack } from '../lib/cdk-pipeline-project-stack';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();
new CdkPipelineProjectStack(app, 'AppStack');
new PipelineStack(app, 'PipelineStack');
