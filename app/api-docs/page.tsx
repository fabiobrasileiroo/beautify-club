// app/api-doc/page.tsx
import { getApiDocs } from '@/lib/swagger';
import ReactSwagger from './react-swagger';

export default async function ApiDocPage() {
  const spec =
    process.env.NODE_ENV === 'development'
      ? getApiDocs()
      : undefined;

  return (
    <div className="pt-6">
      <section className="container">
        <ReactSwagger spec={spec} url="/swagger.json" />
      </section>
    </div>
  );
}
