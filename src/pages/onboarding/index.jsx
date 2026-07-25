import React, { useState } from "react";
import { THEMES, themeVars } from "../../data/themes";
import AuthOnboardStyle from "../../styles/AuthOnboardStyle";
import OnboardingShell from "./OnboardingShell";
import { ONBOARDING_STEPS } from "./steps";
import NameStep from "./steps/NameStep";
import ExamStep from "./steps/ExamStep";
import GoalStep from "./steps/GoalStep";
import MascotStep from "./steps/MascotStep";
import ThemeStep from "./steps/ThemeStep";

const STEP_COMPONENTS = { name: NameStep, exam: ExamStep, goal: GoalStep, mascot: MascotStep, theme: ThemeStep };

export default function Onboarding({ profile, onSave }) {
  const [form, setForm] = useState({
    name: profile?.name || "",
    exam: profile?.exam || "JEE Main",
    exam_date: profile?.exam_date || "2027-01-24",
    daily_goal: profile?.daily_goal || 6,
    theme: profile?.theme || "Sakura Bloom",
    mascot: profile?.mascot || "bunny",
  });
  const [step, setStep] = useState(0);

  const t = THEMES[form.theme];
  const cssVars = themeVars(t);
  const stepId = ONBOARDING_STEPS[step].id;
  const StepComponent = STEP_COMPONENTS[stepId];
  const isLastStep = step === ONBOARDING_STEPS.length - 1;
  const nextDisabled = stepId === "name" && !form.name.trim();

  const goNext = () => {
    if (isLastStep) onSave(form);
    else setStep((s) => s + 1);
  };

  return (
    <div className="sb-onboard" style={cssVars}>
      <AuthOnboardStyle />
      <OnboardingShell
        mascot={form.mascot}
        stepIndex={step}
        title="Welcome to StudyBun 🌸"
        subtitle="Your cozy JEE study companion. Let's set things up."
        onBack={() => setStep((s) => s - 1)}
        onNext={goNext}
        nextDisabled={nextDisabled}
        isLastStep={isLastStep}
        nextLabel="Start studying"
      >
        <StepComponent form={form} setForm={setForm} />
      </OnboardingShell>
    </div>
  );
}
