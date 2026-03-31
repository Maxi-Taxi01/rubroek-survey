export interface SurveyResponse {
  id: string
  created_at: string
  q1_feeling: string | null
  q2_favorite_place: string | null
  q3_why_place: string[] | null
  q3_why_place_other: string | null
  q4_contact_group: string | null
  q5_change_contact_why: string | null
  q6_new_place_choices: string[] | null
  q7_place_should_be: string[] | null
  q7_place_should_be_other: string | null
  q8_absolutely_not: string | null
  q9_contribute: string | null
  q10_contribute_what: string | null
  q11_daily_life_better: string | null
  age_group: string | null
  lives_in_rubroek: string | null
  keep_updated: string | null
  email: string | null
}

export interface SurveyFormData {
  q1_feeling: string
  q2_favorite_place: string
  q3_why_place: string[]
  q3_why_place_other: string
  q4_contact_group: string
  q5_change_contact_why: string
  q6_new_place_choices: string[]
  q7_place_should_be: string[]
  q7_place_should_be_other: string
  q8_absolutely_not: string
  q9_contribute: string
  q10_contribute_what: string
  q11_daily_life_better: string
  age_group: string
  lives_in_rubroek: string
  keep_updated: string
  email: string
  turnstileToken: string
}

export interface AdminFilters {
  dateFrom: string
  dateTo: string
  ageGroup: string
  livesInRubroek: string
  searchQuery: string
}
