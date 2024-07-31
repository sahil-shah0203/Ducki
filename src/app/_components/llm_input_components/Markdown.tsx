/* eslint-disable */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const _mapProps = (props: any) => ({
        ...props,
        remarkPlugins: [
            remarkMath
        ],
        rehypePlugins: [
            rehypeRaw,
            rehypeKatex
        ],
        components: {
            ...props.components,
            math: ({ node, ...props }: { node: any, props: any }): React.ReactElement => {
                return <BlockMath {...props}>{node.value}</BlockMath>;
            },
            inlineMath: ({ node, ...props }: { node: any, props: any }): React.ReactElement => {
                return <InlineMath {...props}>{node.value}</InlineMath>;
            }
        }
    });
    
    const Markdown = (props: any) => <ReactMarkdown {..._mapProps(props)} />;

export default Markdown;