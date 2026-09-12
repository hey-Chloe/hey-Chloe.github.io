import { research, experience, projects, openSource, siteCopy, researchInterests } from "@/data";
import { research as researchEn, experience as experienceEn, projects as projectsEn, openSource as openSourceEn, siteCopy as siteCopyEn, researchInterests as researchInterestsEn } from "@/data/en";
import type { Locale } from "@/lib/localization";

export function localizedContent(locale: Locale) {
  return locale === "en" ? { research: researchEn, experience: experienceEn, projects: projectsEn, openSource: openSourceEn, siteCopy: siteCopyEn, researchInterests: researchInterestsEn } : { research, experience, projects, openSource, siteCopy, researchInterests };
}
