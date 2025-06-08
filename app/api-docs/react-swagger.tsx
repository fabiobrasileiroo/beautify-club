'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

type Props = {
  spec?: Record<string, any>;
  url?: string;
};

export default function ReactSwagger({ spec, url }: Props) {
  return spec ? <SwaggerUI spec={spec} /> : <SwaggerUI url={url!} />;
}
