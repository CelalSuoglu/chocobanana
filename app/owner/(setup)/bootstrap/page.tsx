import { OwnerBootstrapForm } from "@/components/owner-bootstrap-form";

export default function OwnerBootstrapPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl">Owner bootstrap</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#c9a27a]">
        Creates the first OWNER account. Customer registration can never grant
        this role. After one owner exists, this form refuses further creates.
        Set <code className="text-[#f3e6d8]">OWNER_BOOTSTRAP_SECRET</code> in
        the server environment only — see{" "}
        <code className="text-[#f3e6d8]">docs/accounts-and-owner.md</code>.
      </p>
      <OwnerBootstrapForm />
    </div>
  );
}
