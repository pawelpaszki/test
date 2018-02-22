class ImageFreshnessProvider {

  public static getFreshnessGrade(lowVulnCount: number, mediumVulnCount: number, highVulnCcount: number): string {
    if (lowVulnCount >= 180 || mediumVulnCount >= 90 || highVulnCcount >= 30) {
      return 'F';
    } else if (lowVulnCount >= 90 || mediumVulnCount >= 30 || highVulnCcount >= 7) {
      return 'E';
    } else if (lowVulnCount >= 30 || mediumVulnCount >= 7 || highVulnCcount > 0) {
      return 'D';
    } else if ((lowVulnCount >= 7 || mediumVulnCount > 0) && highVulnCcount === 0) {
      return 'C';
    } else if (lowVulnCount > 0 && mediumVulnCount === 0 && highVulnCcount === 0) {
      return 'B';
    } else {
      return 'A';
    }
  }
}

export default ImageFreshnessProvider;
