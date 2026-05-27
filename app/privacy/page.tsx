import { Metadata } from "next";
import { PolicyPageLayout, PolicySection } from "@/components/policy/PolicyPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | Project Karu",
  description: "How Project Karu collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <PolicyPageLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your personal information."
      lastUpdated="May 2026"
    >
      <PolicySection title="Introduction">
        <p>
          Welcome to Project Karu. We are committed to protecting the personal
          information of our customers and website visitors. This Privacy Policy
          explains what information we collect, how we use it, and how we keep it
          safe. By using our website or placing an order with us, you agree to the
          terms of this policy.
        </p>
      </PolicySection>

      <PolicySection title="Information We Collect">
        <p>When you interact with us, we may collect the following information:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Personal details such as your name, phone number, and delivery address
            when you place an order.
          </li>
          <li>
            Communication data such as messages, inquiries, or feedback you send us
            through Instagram, our website, or any other channel.
          </li>
          <li>
            Order details including the products you ordered, customization
            preferences such as names, colors, and designs, and your payment
            information.
          </li>
          <li>
            Technical data such as your IP address, browser type, and how you
            navigate our website, collected automatically through cookies or similar
            tools.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="How We Use Your Information">
        <p>
          We use the information we collect to process and fulfill your orders,
          contact you regarding your order status or delivery updates, respond to
          your questions or support requests, improve our products and website
          experience, and send you updates or promotions if you have opted in to
          receive them. We will never use your information for any purpose beyond
          what is necessary to serve you.
        </p>
      </PolicySection>

      <PolicySection title="Sharing Your Information">
        <p>
          We do not sell, trade, or rent your personal information to third parties.
          We may share your information only in the following limited situations:
          with delivery partners who need your name and address to complete your
          delivery, and with service providers who help us operate our website or
          business, under strict confidentiality. We may also disclose your
          information if required by law or to protect the rights and safety of our
          business or customers.
        </p>
      </PolicySection>

      <PolicySection title="Data Storage and Security">
        <p>
          Your personal information is stored securely and accessed only by
          authorized members of our team. We take reasonable precautions to protect
          your data from unauthorized access, loss, or misuse. However, no method
          of transmission over the internet is completely secure, and we cannot
          guarantee absolute security.
        </p>
      </PolicySection>

      <PolicySection title="Order Videos and Images">
        <p>
          When customers submit unboxing videos or product photos as part of a return
          or exchange claim, these are used solely for verification purposes. We
          will not share, publish, or use these videos for any other purpose without
          your explicit consent.
        </p>
      </PolicySection>

      <PolicySection title="Cookies">
        <p>
          Our website may use cookies to improve your browsing experience and
          understand how visitors use our site. You can choose to disable cookies
          through your browser settings, though this may affect some features of the
          website.
        </p>
      </PolicySection>

      <PolicySection title="Your Rights">
        <p>
          You have the right to request access to the personal information we hold
          about you, ask us to correct any inaccurate information, request that we
          delete your data, and opt out of receiving promotional messages from us at
          any time. To exercise any of these rights, please contact us directly.
        </p>
      </PolicySection>

      <PolicySection title="Children's Privacy">
        <p>
          Our website and services are not directed at children under the age of 13.
          We do not knowingly collect personal information from children. If you
          believe a child has provided us with their information, please contact us
          and we will remove it promptly.
        </p>
      </PolicySection>

      <PolicySection title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. Any changes will be
          posted on this page with an updated date at the top. We encourage you to
          review this policy periodically.
        </p>
      </PolicySection>

      <PolicySection title="Contact Us">
        <p>
          If you have any questions or concerns about this Privacy Policy or how we
          handle your data, you can reach us through our Instagram page at{" "}
          <a
            href="https://instagram.com/projectkaru"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            @projectkaru
          </a>{" "}
          or via the{" "}
          <a href="/contact" className="text-primary font-medium hover:underline">
            contact form
          </a>{" "}
          on our website.
        </p>
      </PolicySection>
    </PolicyPageLayout>
  );
}
