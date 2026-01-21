export interface AIProvider {
  summarize(text: string): Promise<string>;
  sentiment(text: string): Promise<number>;
  getBrandDomain(
    brandName: string,
    hintDomain?: string
  ): Promise<string | null>;
  evaluateBrandClaim(
    brandName: string,
    email: string,
    documentNames: string[]
  ): Promise<number>;
  refineComplaint(
    brandName: string,
    text: string,
    userName?: string,
    userEmail?: string
  ): Promise<string>;
}
