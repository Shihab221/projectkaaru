import { Metadata } from "next";
import { PolicyPageLayout, PolicySection } from "@/components/policy/PolicyPageLayout";

export const metadata: Metadata = {
  title: "Returns & Exchange Policy | Project Karu",
  description:
    "Return and exchange policy for Project Karu orders, including parcel inspection and unboxing video requirements.",
};

export default function ReturnsPage() {
  return (
    <PolicyPageLayout
      title="Returns & Exchange"
      subtitle="Our policies for exchanges, parcel inspection, and unboxing video requirements."
    >
      <PolicySection title="Return & Exchange Policy">
        <p>
          We will exchange your product if it was shipped in a broken or damaged
          condition, has visible cracks, was sent in the wrong color combination,
          or contains a wrong spelling that differs from your confirmed order.
        </p>
        <p>
          To initiate an exchange, contact our customer support within{" "}
          <strong>24 hours</strong> of receiving the product and submit your
          unboxing video along with your order details. Once verified, we will
          arrange a pickup and send a replacement.
        </p>
        <p>
          Please note that exchanges do not apply for change of mind, damage
          caused after delivery, or any claim not supported by a valid unboxing
          video.
        </p>
      </PolicySection>

      <PolicySection title="Parcel Inspection Policy">
        <p>
          Customers must inspect their parcel at the time of delivery and record
          a clear, uninterrupted unboxing video as proof. Recording must begin
          before the parcel is opened or touched, clearly showing the full outer
          packaging including seals and labels, and must continue throughout the
          entire unboxing without pausing.
        </p>
        <p>
          If you do not have a valid unboxing video, we will be unable to process
          any return or exchange claim, regardless of the issue.
        </p>
      </PolicySection>

      <p className="text-sm text-gray-500 pt-2 border-t border-gray-100">
        Questions?{" "}
        <a href="/contact" className="text-primary font-medium hover:underline">
          Contact us
        </a>{" "}
        or reach us on Instagram at{" "}
        <a
          href="https://instagram.com/projectkaru"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium hover:underline"
        >
          @projectkaru
        </a>
        .
      </p>
    </PolicyPageLayout>
  );
}
