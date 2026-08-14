import React from 'react';
import Stepper from '../common/Stepper';

const STEP_LABELS = ['Category', 'Details', 'Media', 'Review'];

interface IssueProgressProps {
  currentStep: number;
}

export default function IssueProgress({ currentStep }: IssueProgressProps) {
  return <Stepper steps={STEP_LABELS} currentStep={currentStep} />;
}
