export default function DisclaimerPage() {
  return (
    <div className="page legal-page">
      <section className="page-hero">
        <h1>Disclaimer &amp; Terms of Use</h1>
        <p>
          Please read this page before using AB-STrout. By using this site,
          you agree to the terms below.
        </p>
      </section>

      <div className="legal-content">
        <section className="legal-section">
          <h2>About AB-STrout</h2>
          <p>
            AB-STrout is an unofficial reference tool for quickly looking up
            stocked trout waters across Alberta. It is intended to help anglers
            explore population estimates, stocking history, and locations in one
            place — not to replace official government resources.
          </p>
        </section>

        <section className="legal-section">
          <h2>Data Sources &amp; Accuracy</h2>
          <p>
            Information on this site is derived from the Alberta Open Government
            publication{' '}
            <a
              href="https://open.alberta.ca/publications/fish-stocking-list"
              target="_blank"
              rel="noopener noreferrer"
            >
              Fish Stocking List
            </a>{' '}
            and related publicly available Alberta trout stocking data. Population
            figures, stocking dates, coordinates, distances, and other statistics
            may be incomplete, outdated, estimated, or contain errors — especially
            where data has been processed, geocoded, or summarized for this site.
          </p>
          <p>
            <strong>Do not rely on this site as your only source of truth.</strong>{' '}
            Always verify stocking status, access rules, seasons, limits, and
            regulations with official Alberta Environment and Protected Areas
            resources, the{' '}
            <a
              href="https://mywildalberta.ca/"
              target="_blank"
              rel="noopener noreferrer"
            >
              My Wild Alberta
            </a>{' '}
            program, and current provincial fishing regulations before you travel
            or fish.
          </p>
        </section>

        <section className="legal-section">
          <h2>No Affiliation</h2>
          <p>
            AB-STrout is not affiliated with, endorsed by, or operated on
            behalf of the Government of Alberta, Alberta Environment and
            Protected Areas, or any other government agency. All trademarks and
            official program names belong to their respective owners.
          </p>
        </section>

        <section className="legal-section">
          <h2>Fishing Regulations &amp; Safety</h2>
          <p>
            You are solely responsible for complying with all applicable fishing
            licences, seasons, bag limits, bait rules, private land access,
            ice safety, and local restrictions. This website does not provide
            legal, safety, or professional angling advice.
          </p>
        </section>

        <section className="legal-section">
          <h2>Disclaimer of Warranties</h2>
          <p>
            This site and all content are provided on an &ldquo;as is&rdquo; and
            &ldquo;as available&rdquo; basis without warranties of any kind,
            whether express or implied, including but not limited to accuracy,
            completeness, fitness for a particular purpose, or non-infringement.
          </p>
        </section>

        <section className="legal-section">
          <h2>Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, the developer of AB-STrout
            shall not be liable for any direct, indirect, incidental, special,
            consequential, or punitive damages arising from your use of — or
            inability to use — this site, including but not limited to lost
            trips, incorrect locations, outdated stocking information, property
            damage, injury, or regulatory violations.
          </p>
        </section>

        <section className="legal-section">
          <h2>External Links &amp; Third-Party Services</h2>
          <p>
            Links to external map services (such as Google Maps) and other
            third-party sites are provided for convenience only. We do not control
            and are not responsible for the content, accuracy, or policies of
            those services.
          </p>
        </section>

        <section className="legal-section">
          <h2>Changes to This Site</h2>
          <p>
            Data, features, and these terms may be updated at any time without
            notice. Continued use of the site after changes are posted constitutes
            acceptance of the revised terms.
          </p>
        </section>

        <section className="legal-section legal-section--credit">
          <h2>Developer</h2>
          <p>
            AB-STrout was created by <strong>Haedyn06</strong> as an
            independent personal project for the Alberta fishing community.
          </p>
          <p className="legal-meta">
            &copy; {new Date().getFullYear()} Haedyn06. All rights reserved.
          </p>
        </section>
      </div>
    </div>
  )
}
