"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const codepipeline = __importStar(require("aws-cdk-lib/aws-codepipeline"));
const actions = __importStar(require("aws-cdk-lib/aws-codepipeline-actions"));
const codebuild = __importStar(require("aws-cdk-lib/aws-codebuild"));
class PipelineStack extends cdk.Stack {
    constructor(scope, id, props) {
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
                    owner: '<YOUR_GITHUB_USERNAME>',
                    repo: '<YOUR_REPO_NAME>',
                    branch: 'main',
                    output: sourceOutput,
                    connectionArn: '<YOUR_CONNECTION_ARN>'
                })
            ]
        });
        const project = new codebuild.PipelineProject(this, 'BuildProject', {
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: { commands: ['npm install -g aws-cdk', 'npm ci'] },
                    build: { commands: ['npm run build', 'cdk synth > template.yml'] }
                },
                artifacts: { 'base-directory': '.', files: ['template.yml', '**/*'] }
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
exports.PipelineStack = PipelineStack;
