/* ===================================================================
   data.js — All site data: publications, projects, timeline, globe
   =================================================================== */

// ─── Area tag config ───────────────────────────────────────────────
const AREA_TAGS = {
  'Deep Sequence Modeling':          { color: '#6366f1', abbr: 'Seq'     },
  'Healthcare AI':                   { color: '#10b981', abbr: 'Health'  },
  'Causal Inference / Survival Analysis': { color: '#f59e0b', abbr: 'Causal'  },
  'Neuro / Biomedical AI':           { color: '#8b5cf6', abbr: 'Neuro'   },
  'Representation Learning':         { color: '#0ea5e9', abbr: 'Repr'    },
  'Multimodal Machine Learning':     { color: '#ec4899', abbr: 'Multi'   },
  'Agentic':                         { color: '#64748b', abbr: 'Agent'   },
  'Robotics':                        { color: '#14b8a6', abbr: 'Robot'   },
  'NLP':                             { color: '#64748b', abbr: 'NLP'     },
  'Machine Learning':                { color: '#94a3b8', abbr: 'ML'      },
  'Neuroengineering':                { color: '#8b5cf6', abbr: 'Neuro'   },
  'Computational Imaging':           { color: '#38bdf8', abbr: 'Image'   },
  'Computational Biology':           { color: '#10b981', abbr: 'Bio'     },
  'Drug Discovery':                  { color: '#fb923c', abbr: 'Drug'    },
};

// ─── Venue badge config ────────────────────────────────────────────
// color is used for glow/hover tint only — visual style driven by CSS class
const VENUE_BADGES = {
  // Archival / published — white family
  'ICML':                   { color: '#f1f5f9' },
  'ICLR':                   { color: '#f1f5f9' },
  'AAAI':                   { color: '#f1f5f9' },
  'CHIL':                   { color: '#f1f5f9' },
  'ML4H':                   { color: '#f1f5f9' },
  'Neuroinformatics':        { color: '#f1f5f9' },
  'Nucleic Acids Research':  { color: '#f1f5f9' },
  // Workshops — cool silver
  'NAACL-SemEval':           { color: '#b8c4d0' },
  'CVPR-Embodied AI':        { color: '#b8c4d0' },
  'AAAI-R2HCAI':             { color: '#b8c4d0' },
  'NeurIPS-FoRLM':           { color: '#b8c4d0' },
  // Preprint / fellowship — light gray
  'Preprint':                { color: '#7a8ea3' },
  'CMLH-Fellowship':         { color: '#7a8ea3' },
};

// ─── Recent Research / Publications ───────────────────────────────
const PUBLICATIONS = [
  {
    id: 'transformer-geometry',
    title: 'Deep sequence models tend to memorize geometrically; it is unclear why.',
    short_title: 'Geometric Memory in Deep Sequence Models',
    venue: 'The Forty-third International Conference on Machine Learning (ICML) 2026',
    venue_badge: ['ICML','NeurIPS-FoRLM'],
    year: 2026,
    image: 'images/Overview_Geometric_Models_Path_Star.jpeg',
    areas: ['Deep Sequence Modeling', 'Representation Learning'],
    authors: 'S. Noroozizadeh, V. Nagarajan, E. Rosenfeld, S. Kumar',
    links: [
      { label: 'Paper', url: 'https://arxiv.org/abs/2510.26745' },
      { label: 'Workshop', url: 'https://openreview.net/pdf?id=2NuCrYf8Ap' },
      { label: 'Code', url: 'https://github.com/Shahriarnz14/Geometric_Memory' }
    ],
    abstract: `Deep sequence models are said to store atomic facts predominantly in the form of associative memory: a brute-force lookup of co-occurring entities. We identify a dramatically different form of storage of atomic facts that we term as geometric memory. Here, the model has synthesized embeddings encoding novel global relationships between all entities, including ones that do not co-occur in training. Such storage is powerful: for instance, we show how it transforms a hard reasoning task involving an ℓ-fold composition into an easy-to-learn 1-step navigation task.

From this phenomenon, we extract fundamental aspects of neural embedding geometries that are hard to explain. We argue that the rise of such a geometry, as against a lookup of local associations, cannot be straightforwardly attributed to typical supervisory, architectural, or optimizational pressures. Counterintuitively, a geometry is learned even when it is more complex than the brute-force lookup.

Then, by analyzing a connection to Node2Vec, we demonstrate how the geometry stems from a spectral bias that — in contrast to prevailing theories — indeed arises naturally despite the lack of various pressures. This analysis also points out to practitioners a visible headroom to make Transformer memory more strongly geometric. We hope the geometric view of parametric memory encourages revisiting the default intuitions that guide researchers in areas like knowledge acquisition, capacity, discovery, and unlearning.`,
  },
  {
    id: 't2s2',
    title: 'Reconstructing Sepsis Trajectories from Clinical Case Reports using LLMs: the Textual Time Series Corpus for Sepsis (T2S2)',
    short_title: 'T2S2: Sepsis Trajectory Reconstruction',
    venue: 'Conference on Health, Inference, and Learning (CHIL) 2026',
    venue_badge: 'CHIL',
    year: 2026,
    image: 'images/T2S2-CHIL-Main-Figure.png',
    areas: ['Deep Sequence Modeling', 'Healthcare AI'],
    authors: 'S. Noroozizadeh, J. Weiss',
    links: [
      { label: 'Paper', url: 'https://arxiv.org/abs/2504.12326' },
      { label: 'Code', url: 'https://github.com/Shahriarnz14/T2S2' },
    ],
    abstract: `Clinical case reports and discharge summaries may be the most complete and accurate summarization of patient encounters, yet they are finalized, i.e., timestamped after the encounter. Complementary structured data streams become available sooner but suffer from incompleteness. To train models and algorithms on more complete and temporally fine-grained data, we construct a pipeline to phenotype, extract, and annotate time-localized findings within case reports using large language models. We apply our pipeline to generate an open-access textual time series corpus for Sepsis-3 comprising 2,139 case reports from the PubMed-Open Access (PMOA) Subset. To validate our system, we apply it to PMOA and timeline annotations from i2b2/MIMIC-IV and compare the results to physician-expert annotations. We show high recovery rates of clinical findings (event match rates: GPT-5–0.93, Llama 3.3 70B Instruct–0.76) and strong temporal ordering (concordance: GPT-5–0.965, Llama 3.3 70B Instruct–0.908). Our work characterizes the ability of LLMs to time-localize clinical findings in text, illustrating the limitations of LLM use for temporal reconstruction and providing several potential avenues of improvement via multimodal integration.`,
  },
  {
    id: 'text-knows-tables-know',
    title: 'Text Knows What, Tables Know When: Clinical Timeline Reconstruction via Retrieval-Augmented Multimodal Alignment',
    short_title: 'Text Knows What, Tables Know When',
    venue: 'Preprint (ArXiv)',
    venue_badge: 'Preprint',
    year: 2026,
    image: 'images/TTA-Overview-Figures.png',
    areas: ['Deep Sequence Modeling', 'Healthcare AI', 'Multimodal Machine Learning'],
    authors: 'S. Kumar *, S. Noroozizadeh *, J. Kim *, J. Weiss',
    links: [
      { label: 'ArXiv', url: 'https://arxiv.org/abs/2605.15168' },
      { label: 'Code', url: 'https://github.com/SayantanKumar/MLHC_TTA' },
    ],
    abstract: `Reconstructing precise clinical timelines is essential for modeling patient trajectories and forecasting risk in complex, heterogeneous conditions like sepsis. While unstructured clinical narratives offer semantically rich and contextually complete descriptions of a patient's course, they often lack temporal precision and contain ambiguous event timing. Conversely, structured electronic health record (EHR) data provides precise temporal anchors but misses a substantial portion of clinically meaningful events. We introduce a retrieval-augmented multimodal alignment framework that bridges this gap to improve the temporal precision of absolute clinical timelines extracted from text. Our approach formulates timeline reconstruction as a graph-based multistep process: it first extracts central anchor events from narratives to build an initial temporal scaffold, places non-central events relative to this backbone, and then calibrates the timeline using retrieved structured EHR rows as external temporal evidence. Evaluated using instruction-tuned large language models on the i2m4 benchmark spanning MIMIC-III and MIMIC-IV, our multimodal pipeline consistently improves absolute timestamp accuracy (AULTC) and improves temporal concordance across nearly all evaluated models over unimodal text-only reconstruction, without compromising event match rates. Furthermore, our empirical gap analysis reveals that 34.8% of text-derived events are entirely absent from tabular records, demonstrating that aligning these modalities can produce a more temporally faithful and clinically informative reconstruction of patient trajectories than either source alone.`,
  },
  {
    id: 'surv-hte',
    title: 'SurvHTE-Bench: A Benchmark for Heterogeneous Treatment Effect Estimation in Survival Analysis',
    short_title: 'SurvHTE-Bench',
    venue: 'ICLR 2026',
    venue_badge: 'ICLR',
    year: 2026,
    image: 'images/SurvHTE-Bench.png',
    areas: ['Causal Inference / Survival Analysis', 'Healthcare AI'],
    authors: 'S. Noroozizadeh *, X. Shen *, J. Weiss, G. Chen',
    links: [
      { label: 'Paper', url: 'https://openreview.net/pdf?id=qG6O3jMkCj' },
      { label: 'Data & Code', url: 'https://github.com/Shahriarnz14/SurvHTE-Benchmark' },
    ],
    abstract: `Estimating heterogeneous treatment effects (HTEs) from right-censored survival data is critical in high-stakes applications such as precision medicine and individualized policy-making. Yet, the survival analysis setting poses unique challenges for HTE estimation due to censoring, unobserved counterfactuals, and complex identification assumptions. Despite recent advances, from causal survival forests to survival meta-learners and outcome imputation approaches, evaluation practices remain fragmented and inconsistent. We introduce SurvHTE‐Bench, the first comprehensive benchmark for HTE estimation with censored outcomes. The benchmark spans (i) a modular suite of synthetic datasets with known ground truth, systematically varying causal assumptions and survival dynamics, (ii) semi-synthetic datasets that pair real-world covariates with simulated treatments and outcomes, and (iii) real-world datasets from a twin study (with known ground truth) and from an HIV clinical trial. Across synthetic, semi-synthetic, and real-world settings, we provide the first rigorous comparison of survival HTE methods under diverse conditions and realistic assumption violations. SurvHTE‐Bench establishes a foundation for fair, reproducible, and extensible evaluation of causal survival methods.`,
  },
  {
    id: 'tts-forecast',
    title: 'Forecasting Clinical Risk from Textual Time Series: Structuring Narratives for Temporal AI in Healthcare',
    short_title: 'Forecasting Clinical Risk from Textual Time Series',
    venue: 'AAAI 2026',
    venue_badge: 'AAAI',
    year: 2026,
    image: 'images/TTS-Forecasts.png',
    areas: ['Deep Sequence Modeling', 'Healthcare AI'],
    authors: 'S. Noroozizadeh *, S. Kumar *, J. Weiss',
    links: [
      { label: 'Paper', url: 'https://arxiv.org/abs/2504.10340' },
      { label: 'Code', url: 'https://github.com/Shahriarnz14/Textual-Time-Series-Forecasting' },
    ],
    abstract: `Clinical case reports encode rich, temporal patient trajectories that are often underexploited by traditional machine learning methods relying on structured data. In this work, we introduce the forecasting problem from textual time series, where timestamped clinical findings — extracted via an LLM-assisted annotation pipeline — serve as the primary input for prediction. We systematically evaluate a diverse suite of models, including fine-tuned decoder-based large language models and encoder-based transformers, on tasks of event occurrence prediction, temporal ordering, and survival analysis. Our experiments reveal that encoder-based models consistently achieve higher F1 scores and superior temporal concordance for short- and long-horizon event forecasting, while fine-tuned masking approaches enhance ranking performance. In contrast, instruction-tuned decoder models demonstrate a relative advantage in survival analysis, especially in early prognosis settings. Our sensitivity analyses further demonstrate the importance of time ordering, which requires clinical time series construction, as compared to text ordering, the format of the text inputs that LLMs are classically trained on. This highlights the additional benefit that can be ascertained from time-ordered corpora, with implications for temporal tasks in the era of widespread LLM use.`,
  },
  {
    id: 'pmoa-tts',
    title: 'PubMed Open Access Textual Times Series Corpus: Reconstructing patient trajectories from clinical case reports using LLMs',
    short_title: 'PMOA-TTS Corpus',
    venue: 'Preprint (ArXiv)',
    venue_badge: 'Preprint',
    year: 2026,
    image: 'images/Textual-Time-Series.png',
    areas: ['Deep Sequence Modeling', 'Healthcare AI'],
    authors: 'S. Noroozizadeh *, S. Kumar *, G. Chen, J. Weiss',
    links: [
      { label: 'ArXiv (PMOA-TTS)', url: 'https://arxiv.org/abs/2505.20323' },
      { label: 'Code', url: 'https://github.com/jcweiss2/pmoa_tts' },
      { label: 'Data', url: 'https://huggingface.co/datasets/snoroozi/pmoa-tts' },
    ],
    abstract: `Understanding temporal dynamics in clinical narratives is essential for modeling patient trajectories, yet large-scale temporally annotated resources remain limited. We present PMOA-TTS, the first openly available dataset of 124,699 PubMed Open Access (PMOA) case reports, each converted into structured (event, time) timelines via a scalable LLM-based pipeline. Our approach combines heuristic filtering with Llama 3.3 to identify single-patient case reports, followed by prompt-driven extraction using Llama 3.3 and DeepSeek R1, resulting in over 5.6 million timestamped clinical events. To assess timeline quality, we evaluate against a clinician-curated reference set using three metrics: (i) event-level matching (80% match at a cosine similarity threshold of 0.1), (ii) temporal concordance (c-index > 0.90), and (iii) Area Under the Log-Time CDF (AULTC) for timestamp alignment. Corpus-level analysis shows wide diagnostic and demographic coverage. In a downstream survival prediction task, embeddings from extracted timelines achieve time-dependent concordance indices up to 0.82 ± 0.01, demonstrating the predictive value of temporally structured narratives. PMOA-TTS provides a scalable foundation for timeline extraction, temporal reasoning, and longitudinal modeling in biomedical NLP.`,
  },
  {
    id: 'causal-survival',
    title: 'The Impact of Medication Non-adherence on Adverse Outcomes: Evidence from Schizophrenia Patients via Survival Analysis',
    short_title: 'Causal Survival Analysis: Schizophrenia',
    venue: 'CHIL 2025',
    venue_badge: 'CHIL',
    year: 2025,
    image: 'images/Causal-Survival-Analysis-CHIL.png',
    areas: ['Causal Inference / Survival Analysis', 'Healthcare AI'],
    authors: 'S. Noroozizadeh, P. Welle, J. Weiss, G. Chen',
    links: [
      { label: 'Paper', url: 'https://proceedings.mlr.press/v287/noroozizadeh25a.html' },
      { label: 'Code', url: 'https://github.com/Shahriarnz14/causal-meta-learner-survival-analysis' },
    ],
    abstract: `This study quantifies the association between non-adherence to antipsychotic medications and adverse outcomes in individuals with schizophrenia. We frame the problem using survival analysis, focusing on the time to the earliest of several adverse events (early death, involuntary hospitalization, jail booking). We extend standard causal inference methods (T-learner, S-learner, nearest neighbor matching) to utilize various survival models to estimate individual and average treatment effects, where treatment corresponds to medication non-adherence. Analyses are repeated using different amounts of longitudinal information (3, 6, 9, and 12 months). Using data from Allegheny County in western Pennsylvania, we find strong evidence that non-adherence advances adverse outcomes by approximately 1 to 4 months. Ablation studies confirm that county-provided risk scores adjust for key confounders, as their removal amplifies the estimated effects. Subgroup analyses by medication formulation (injectable vs. oral) and medication type consistently show that non-adherence is associated with earlier adverse events. These findings highlight the clinical importance of adherence in delaying psychiatric crises and show that integrating survival analysis with causal inference tools can yield policy-relevant insights.`,
  },
  {
    id: 'mrna-lm',
    title: 'mRNA-LM: full-length integrated SLM for mRNA analysis',
    short_title: 'mRNA-LM',
    venue: 'Nucleic Acids Research 2025',
    venue_badge: 'Nucleic Acids Research',
    year: 2025,
    image: 'images/mRNA-LM.png',
    areas: ['Representation Learning', 'Neuro / Biomedical AI'],
    authors: 'S. Li, S. Noroozizadeh, S. Moayedpour, L. Kogler-Anele, Z. Xue, D. Zheng, F. Ulloa Montoya, V. Agarwal, Z. Bar-Joseph, S. Jager',
    links: [
      { label: 'Paper', url: 'https://academic.oup.com/nar/article/53/3/gkaf044/7997216' },
      { label: 'Code', url: 'https://github.com/Sanofi-Public/mRNA-LM' },
      { label: 'Patent', url: 'https://patents.google.com/patent/WO2025026948A1' },
    ],
    abstract: `The success of SARS-CoV-2 messenger RNA (mRNA) vaccine has led to increased interest in the design and use of mRNA for vaccines and therapeutics. Still, selecting the most appropriate mRNA sequence for a protein remains a challenge. Several recent studies have shown that the specific mRNA sequence can have a significant impact on the translation efficiency, half-life, degradation rates, and other issues that play a major role in determining vaccine efficiency. To enable the selection of the most appropriate sequence, we developed mRNA-LM, an integrated small language model for modeling the entire mRNA sequence. mRNA-LM uses the contrastive language–image pretraining integration technology to combine three separate language models for the different mRNA segments. We trained mRNA-LM on millions of diverse mRNA sequences from several different species. The unsupervised model was able to learn meaningful biology related to evolution and host–pathogen interactions. Fine-tuning of mRNA-LM allowed us to use it in several mRNA property prediction tasks. As we show, using the full-length integrated model led to accurate predictions, improving on prior methods proposed for this task.`,
  },
  {
    id: 'tldr',
    title: 'T5-generated clinical-Language summaries for DeBERTa Report Analysis (TLDR)',
    short_title: 'TLDR: Clinical NLI',
    venue: 'SemEval-2024 at NAACL',
    venue_badge: 'NAACL-SemEval',
    year: 2024,
    image: 'images/TLDR-Model.jpg',
    areas: ['Healthcare AI'],
    authors: 'S. Das *, V. Samuel *, S. Noroozizadeh *',
    links: [
      { label: 'Paper', url: 'https://aclanthology.org/2024.semeval-1.79/' },
      { label: 'Code', url: 'https://github.com/Shahriarnz14/TLDR-T5-generated-clinical-Language-for-DeBERTa-Report-Analysis' },
    ],
    abstract: `This paper introduces novel methodologies for the Natural Language Inference for Clinical Trials (NLI4CT) task. We present TLDR (T5-generated clinical-Language summaries for DeBERTa Report Analysis) which incorporates T5-model generated premise summaries for improved entailment and contradiction analysis in clinical NLI tasks. This approach overcomes the challenges posed by small context windows and lengthy premises, leading to a substantial improvement in Macro F1 scores: a 0.184 increase over truncated premises. Our comprehensive experimental evaluation, including detailed error analysis and ablations, confirms the superiority of TLDR in achieving consistency and faithfulness in predictions against semantically altered inputs.`,
  },
  {
    id: 'tscl',
    title: 'Temporal-Supervised Contrastive Learning: Modeling Patient Risk Progression',
    short_title: 'Temporal-Supervised Contrastive Learning',
    venue: "Machine Learning for Healthcare (ML4H) 2023",
    venue_badge: ['ML4H', 'AAAI-R2HCAI'],
    year: 2023,
    image: 'images/TSCL-MIMIC.jpg',
    areas: ['Deep Sequence Modeling', 'Representation Learning', 'Healthcare AI'],
    authors: 'S. Noroozizadeh, J. Weiss, G. Chen',
    links: [
      { label: 'Paper (ML4H)', url: 'https://proceedings.mlr.press/v225/noroozizadeh23a.html' },
      { label: 'Paper (AAAI)', url: 'https://r2hcai.github.io/AAAI-23/files/CameraReadys/46.pdf' },
      { label: 'Code', url: 'https://github.com/Shahriarnz14/Temporal-Supervised-Contrastive-Learning' },
    ],
    abstract: `We consider the problem of predicting how the likelihood of an outcome of interest for a patient changes over time as we observe more of the patient's data. To solve this problem, we propose a supervised contrastive learning framework that learns an embedding representation for each time step of a patient time series. Our framework learns the embedding space to have the following properties: (1) nearby points in the embedding space have similar predicted class probabilities, (2) adjacent time steps of the same time series map to nearby points in the embedding space, and (3) time steps with very different raw feature vectors map to far apart regions of the embedding space. To achieve property (3), we employ a nearest neighbor pairing mechanism in the raw feature space. This mechanism also serves as an alternative to "data augmentation", a key ingredient of contrastive learning, which lacks a standard procedure that is adequately realistic for clinical tabular data, to our knowledge. We demonstrate that our approach outperforms state-of-the-art baselines in predicting mortality of septic patients (MIMIC-III dataset) and tracking progression of cognitive impairment (ADNI dataset).`,
  },
  {
    id: 'cmlh',
    title: 'Contrastive Learning Based Interpretable Hospital Discharge Delay Prediction',
    short_title: 'Hospital Discharge Delay Prediction',
    venue: 'CMLH Fellowship',
    venue_badge: 'CMLH-Fellowship',
    year: 2022,
    image: 'images/CMLH.jpg',
    areas: ['Healthcare AI'],
    authors: 'S. Noroozizadeh, L. Weiss, J. Weiss, G. Chen',
    links: [],
    abstract: `We addressed the significant challenge of delays in patient discharge across hospitals. Over an 11-month period, more than 63% of discharges at four UPMC hospitals were delayed, leading to costs of an estimated $6.6 million in the sampled hospital units. These delays adversely affect patient experience and health outcomes, exacerbated by issues like the lack of post-discharge patient transportation and ineffective capacity management in the health system. Throughout the CMLH fellowship, we aimed to mitigate these issues by developing a discharge delay prediction module. This initiative was divided into two phases: (1) Length of Stay Prediction: Various regression models were benchmarked using prehospital data. (2) Predictability Analysis: Building on initial insights, the prediction task was refined based on length of stay percentiles. A key innovation in this study was the application of a contrastive learning approach. This methodology significantly outperformed traditional models, including Random Forest, XGBoost, Support Vector Machines, Logistic Regression, and Fully-Connected Neural Networks.`,
  },
  {
    id: 'et-clip',
    title: 'Pre-trained CLIP Encoder for Embodied Instruction Following in ALFRED',
    short_title: 'ET-CLIP: Embodied Instruction Following',
    venue: 'CVPR Embodied AI Workshop 2022',
    venue_badge: 'CVPR-Embodied AI',
    year: 2022,
    image: 'images/et-clip.jpg',
    areas: ['Representation Learning', 'Multimodal Machine Learning'],
    authors: 'Y.W. Byon *, C. Jiao *, S. Noroozizadeh *, J. Sun *, R. Vitiello *',
    links: [
      { label: 'Paper', url: 'https://embodied-ai.org/papers/2022/20.pdf' },
    ],
    abstract: `We introduce a method employing pre-trained CLIP encoders to enhance model generalization in the ALFRED task. In contrast to previous literature where CLIP replaces the visual encoder, we suggest using CLIP as an additional module through an auxiliary object detection objective. We validate our method on the recently proposed Episodic Transformer architecture and demonstrate that incorporating CLIP improves task performance on the unseen validation set. Additionally, our analysis results support that CLIP especially helps with leveraging object descriptions, detecting small objects, and interpreting rare words.`,
  },
  {
    id: 'neuroinformatics',
    title: 'Automatic Brain Pathology Analysis for Traumatic Brain Injury',
    short_title: 'Brain Pathology Analysis: TBI',
    venue: 'Neuroinformatics Journal 2019',
    venue_badge: 'Neuroinformatics',
    year: 2019,
    image: 'images/neuroinformatics.jpg',
    areas: ['Neuro / Biomedical AI'],
    authors: 'A.D. Kyriazis *, S. Noroozizadeh *, A. Refaee *, W. Choi *, L.T. Chu *, A. Bashir, W.H. Cheng, R. Zhao, D.R. Namjoshi, S.E. Salcudean, C.L. Wellington, G. Nir',
    links: [
      { label: 'Paper', url: 'https://link.springer.com/article/10.1007/s12021-018-9405-x' },
    ],
    abstract: `Traumatic brain injury (TBI) is one of the leading causes of death and disability worldwide. Detailed studies of the microglial response after TBI require high throughput quantification of changes in microglial count and morphology in histological sections throughout the brain. In this paper, we present a fully automated end-to-end system that is capable of assessing microglial activation in white matter regions on whole slide images of Iba1 stained sections. Our approach involves the division of the full brain slides into smaller image patches that are subsequently automatically classified into white and grey matter sections. On the patches classified as white matter, we jointly apply functional minimization methods and deep learning classification to identify Iba1-immunopositive microglia. Detected cells are then automatically traced to preserve their complex branching structure after which fractal analysis is applied to determine the activation states of the cells. The resulting system detects white matter regions with 84% accuracy, detects microglia with a performance level of 0.70 (F1 score) and performs binary microglia morphology classification with a 70% accuracy.`,
  },
];

// ─── Past Projects ─────────────────────────────────────────────────
const PROJECTS = [
  {
    id: 'conformal-abstention',
    title: 'Knowing When to Generate: Selective Generation with Conformal Abstention for Human Preference Alignment',
    image: 'images/conformal-abstention.png',
    areas: ['Machine Learning', 'Multimodal Machine Learning', 'Computer Vision', 'NLP'],
    links: [{ label: 'Code', url: 'https://github.com/Minxing-Zheng/when-to-generate-conformal-abstention' }],
    description: `Standard text-to-image pipelines return outputs even when all sampled candidates are visually poor or misaligned. We frame this problem as <em>selective generation</em>, where a system abstains from returning unreliable images. We propose a plug-and-play conformal abstention layer that wraps pretrained generators and human-preference reward models without retraining. This post hoc calibrator provides a distribution-free risk-control guarantee on the failure rate among accepted outputs. Evaluated on Pick-a-Pic prompts using SDXL-Turbo, conformal abstention achieves the highest selective accuracy and strongest empirical guarantees among baselines, demonstrating that post hoc calibration effectively makes generative systems reliability-aware.`,
  },
  {
    id: 'many-shot-icl',
    title: 'Many-Shot In-Context Learning for Molecular Inverse Design',
    image: 'images/ManyShotICL.jpg',
    areas: ['Drug Discovery', 'Multimodal Machine Learning'],
    links: [{ label: 'Paper', url: 'https://arxiv.org/abs/2407.19089' }],
    description: `Large Language Models (LLMs) have demonstrated great performance in few-shot In-Context Learning (ICL) for a variety of generative and discriminative chemical design tasks. The newly expanded context windows of LLMs can further improve ICL capabilities for molecular inverse design and lead optimization. To take full advantage of these capabilities we developed a new semi-supervised learning method that overcomes the lack of experimental data available for many-shot ICL. Our approach involves iterative inclusion of LLM generated molecules with high predicted performance, along with experimental data. We further integrated our method in a multi-modal LLM which allows for the interactive modification of generated molecular structures using text instructions. As we show, the new method greatly improves upon existing ICL methods for molecular design while being accessible and easy to use for scientists.`,
  },
  {
    id: 'bert-crf',
    title: '"BERT, do you still love me?" A painful perspective from CRF',
    image: 'images/BERT_CRF.jpg',
    areas: ['NLP', 'Representation Learning'],
    links: [],
    description: `[Best Poster Award: Probabilistic Graphical Models] Developed and compiled a comprehensive study of using graphical models on top of BERT and RNN variants for evaluating the encoding capacity of these models in Part of Speech Tagging (POS) and Named Entity Recognition (NER) tasks. Provided evidence of performance boost with end-to-end training of a conditional random field (CRF) on top of a pretrained BERT.`,
  },
  {
    id: 'pets-mbrl',
    title: 'Model-Based Reinforcement Learning with Probabilistic Ensemble and Trajectory Sampling',
    image: 'images/PETS_MBRL.jpg',
    areas: ['Robotics', 'Machine Learning'],
    links: [{ label: 'Code', url: 'https://github.com/Shahriarnz14/Model-Based-RL-with-Probabilistic-Ensemble-and-Trajectory-Sampling' }],
    description: `Implemented the PETS algorithm as a model-based RL method to solve the Pusher environment of OpenAI-Gym for a robotic arm to push an object to reach to a randomly positioned goal location: (i) Using probabilistic ensemble of neural networks outputting distribution over the resulting states given a state and action pair. (ii) Propagate hallucinated trajectories through time by passing hypothetical state-action pairs through different networks of the ensemble. (iii) Planning with model predictive control (MPC) on top of Cross Entropy Method (CEM) for random shooting.`,
  },
  {
    id: 's3vm',
    title: 'Semi-Supervised Support Vector Machine (S3VM)',
    image: 'images/S3VM.jpg',
    areas: ['Machine Learning'],
    links: [{ label: 'Code', url: 'https://github.com/Shahriarnz14/Semi-Supervised-Support-Vector-Machine-S3VM' }],
    description: `Developed a self-training scheme with SVM to improve classification accuracy of the training data when only a small subset is labeled. Additionally, implemented a quasi-Newton method Semisupervised Support Vector Machine (S3VM). Applied these two techniques for the task of image classification of MNIST and CIFAR10 datasets. Showed significant improvement in classification accuracy in the range that only 30%–50% of data is labeled as compared to conventional SVM.`,
  },
  {
    id: 'tfus',
    title: 'Transcranial Focused Ultrasound Stimulation (tFUS)',
    image: 'images/tFUS.jpg',
    areas: ['Neuroengineering'],
    links: [{ label: 'Thesis', url: 'https://drive.google.com/file/d/1iUfV4gimAnLFZUf9FgRXyzKLeEfHwaw9/view?usp=drive_link' }],
    description: `Thesis: Characterization of Transcranial Focused Ultrasound Field to Reduce Ultrasonic Standing Waves. Multiple neural engineering research projects ranging from neural device development and neural signal processing and computation. Developed a novel method for enhancing the neuromodulation modality of transcranial Focused Ultrasound Stimulation (tFUS) through computer simulations, ex-vivo experimentation, and in-vivo rodent model demonstration. Utilizing unsupervised learning algorithms for automated spike sorting of in-vivo intracranial neural data collected. Contributing with MRI and non-invasive Brain Computer Interface (BCI) experimentation for enhancing the control of 2D cursor.`,
  },
  {
    id: 'pat-gpu',
    title: 'A GPU-Accelerated Inversion Algorithm for Photoacoustic Tomography',
    image: 'images/PATgpu_research.jpg',
    areas: ['Computational Imaging'],
    links: [],
    description: `Developed GPU-Accelerated Inversion Algorithm for Photoacoustic Tomography. The implemented algorithm reduces the computation time for photoacoustic tomography for the research in the field of breast cancer screening. Using multi-threaded and parallel processing feature of GPU architecture with CUDA, we worked on a real-time 3D visualization of the imaging at the time of the diagnosis.`,
  },
  {
    id: 'usc-sequencing',
    title: 'Pre-clustering RNA sequences Database for Long-read de Novo Transcriptome Error Correction',
    image: 'images/USCsequencing_Preclustering.jpg',
    areas: ['Computational Biology', 'Machine Learning'],
    links: [],
    description: `Developed unsupervised machine learning algorithms for pre-clustering Pacific Biosciences RNA sequences database and improving the grouping of similar transcripts to be used for long-read de novo transcriptome error correction. The results obtained from this clustering method achieves better accuracy and runtime for CONVEX tool for fast and accurate de novo transcriptome recovery from long reads.`,
  },
  {
    id: 'batbot',
    title: 'Rescue-Bot: BatBot Rescuing Pets from Fire',
    image: 'images/batbot.jpg',
    areas: ['Robotics'],
    links: [{ label: 'Code', url: 'https://github.com/Shahriarnz14/Batbot' }],
    description: `Fully designed, built, and tested an autonomous robot to rescue 6 pets and managed to finish the competition as the quarter-finalist among 16 teams. 500+ hours of work on: Implemented more than 2000 lines of C++ code including control algorithms for the drive system and the robotic arm. Designed and built circuits such as H-bridge (run motors), IR receiver circuit (to find the last two pets, and find the way back), Pulse-Width Modulation circuit (to feed the motors), and various signal filters. Designed and built the full body of the robot using a CAD software (SolidWorks) and made a robotic arm able to collect pets placed in all possible coordinates of space. Made full use of fabrication tools: Waterjet, laser cutter, 3D printer.`,
  },
];

// ─── Work Experience Timeline ──────────────────────────────────────
const TIMELINE = [
  {
    id: 'microsoft',
    label: 'Microsoft',
    full_name: 'Microsoft',
    role: 'Software Engineering Intern',
    period: '2015',
    location: 'Vancouver, BC, Canada',
    logo: 'images/microsoft.jpg',
    type: 'industry',
    details: `Software Engineering Intern [2015]: Main focus areas researched and worked on during this internship included: Windows 10 Universal Application Platform (UAP), Windows 10 NFL Application, a Key Performance Indicator (KPI) System, Mocking Framework, Coded User Interface (UI) Automation, and Build Machine Automation.`,
  },
  {
    id: 'philips',
    label: 'Philips Healthcare Research',
    full_name: 'Philips Healthcare Research',
    role: 'Research and Development Intern',
    period: '2016',
    location: 'Eindhoven, The Netherlands',
    logo: 'images/philips.jpeg',
    type: 'industry',
    details: `Research and Development Intern [2016]: Developed an electronic nose sensor that is capable of selectively and sensitively detect biomarkers in exhaled breath to improve the emergency diagnosis of lung infections for patients with respiratory diseases including Acute Respiratory Distress Syndrome (ARDS). Designed a standalone signal processing algorithm and application tailored for gas chromatography data, which effectively isolated the presence of octane — a critical biomarker of ARDS in exhaled breath.`,
  },
  {
    id: 'sanofi',
    label: 'Sanofi',
    full_name: 'Sanofi Inc.',
    role: 'A.I. Research Scientist Intern',
    period: 'Summer 2024',
    location: 'Cambridge, MA, USA',
    logo: 'images/sanofi-logo.jpeg',
    type: 'industry',
    details: `A.I. Research Scientist Intern [2024]: Co-led the development of the mRNA-LM model, a language model built from scratch and pretrained on millions of full-length mRNA sequences, achieving state-of-the-art performance on various mRNA prediction tasks. Designed and implemented a contrastive learning-based multimodal joint representation inspired by CLIP. Spearheaded submitting a paper to Nucleic Acids Research journal (IF: 16.8) and supported the filing of a patent for the mRNA-LM project. Contributed to Many-Shot In-Context Learning for Molecular Inverse Design.`,
  },
  {
    id: 'google',
    label: 'Google Research',
    full_name: 'Google Research',
    role: 'A.I. PhD Student Researcher',
    period: '2025',
    location: 'New York, NY, USA',
    logo: 'images/Google-Research.webp',
    type: 'industry',
    details: `A.I. PhD Student Researcher [2025]: Isolated a clean and analyzable instance of implicit in-weights reasoning in Transformers, demonstrating that their memory is better characterized by global geometric structure rather than purely local associative storage. Provided both empirical and theoretical evidence connecting this emergent geometric memory to spectral bias in Node2Vec-style dynamics. Investigating the sufficiency of next-token prediction (NTP) as a training paradigm for large language models. Hosted by Vaishnavh Nagarajan, collaborating with Elan Rosenfeld.`,
  },
  {
    id: 'microsoft-research',
    label: 'Microsoft Research',
    full_name: 'Microsoft Research',
    role: 'A.I. Research Intern',
    period: 'May 2026',
    location: 'Redmond, WA, USA',
    logo: 'images/msr.jpeg',
    type: 'industry',
    details: `AI Research Intern [2026]: Researching multimodal reasoning and AI triage systems for contextual healthcare decision-making using longitudinal and conversational patient signals.`,
  },
];

// ─── Globe: visited location dots ──────────────────────────────────
// Each entry: { lat, lng, label, sublabel, type }
// label format: "City, State/Province, Country"
const LOCATION_PINS = [
  { lat: 40.4433,  lng: -79.9436,  label: 'Pittsburgh, PA, USA',        sublabel: 'Visited', type: 'visited' },
  { lat: 40.7128,  lng: -74.0060,  label: 'New York, NY, USA',          sublabel: 'Visited', type: 'visited' },
  { lat: 42.3601,  lng: -71.0589,  label: 'Cambridge, MA, USA',         sublabel: 'Visited', type: 'visited' },
  { lat: 49.2606,  lng: -123.2460, label: 'Vancouver, BC, Canada',      sublabel: 'Visited', type: 'visited' },
  { lat: 35.6892,  lng:  51.3890,  label: 'Tehran, Tehran, Iran',       sublabel: 'Visited', type: 'visited' },
  { lat:  1.3521,  lng: 103.8198,  label: 'Singapore, Singapore',       sublabel: 'Visited', type: 'visited' },
  { lat: -22.9068, lng: -43.1729,  label: 'Rio de Janeiro, RJ, Brazil', sublabel: 'Visited', type: 'visited' },
  { lat: 37.5665,  lng: 126.9780,  label: 'Seoul, South Korea',         sublabel: 'Visited', type: 'visited' },
];

// ─── Globe: conference attendance flags (dark red markers) ─────────
// To add a new location: push a new object with lat/lng/city/conferences.
// city format: "City, State/Province, Country"
const CONFERENCE_PINS = [
  {
    lat: -22.9068, lng: -43.1729,
    city: 'Rio de Janeiro, RJ, Brazil',
    conferences: ['ICLR 2026'],
  },
  {
    lat:  1.3521, lng: 103.8198,
    city: 'Singapore, Singapore',
    conferences: ['AAAI 2026'],
  },
  {
    lat: 37.5665, lng: 126.9780,
    city: 'Seoul, South Korea',
    conferences: ['ICML 2026'],
  },
  {
    lat: 29.9511, lng: -90.0715,
    city: 'New Orleans, LA, USA',
    conferences: ['ML4H 2023', 'NeurIPS 2023'],
  },
  {
    lat: 32.7157, lng: -117.1611,
    city: 'San Diego, CA, USA',
    conferences: ['ML4H 2025', 'NeurIPS 2025'],
  },
  {
    lat: 37.8716, lng: -122.2727,
    city: 'Berkeley, CA, USA',
    conferences: ['CHIL 2025'],
  },
  {
    lat: 47.6062, lng: -122.3321,
    city: 'Seattle, WA, USA',
    conferences: ['CHIL 2026'],
  },
];

// Backward-compat alias; visitor pins appended here at runtime
const GLOBE_PINS = LOCATION_PINS.slice();

// ─── Visitor tracker: mock seed data ──────────────────────────────
//
// These are the cities pre-seeded on the globe before real visitor
// tracking began (May 2026).  They serve two purposes:
//
//   1. The visitor counter starts at MOCK_VISITOR_OFFSET instead of 0.
//   2. Real visitors from these cities reuse the existing pin rather
//      than adding a duplicate — the city is simply "graduated".
//
// HOW TO RETIRE A MOCK CITY:
//   When a real visitor arrives from one of these cities the tracker
//   automatically skips adding a duplicate pin.  Once you are happy
//   that the real data covers a city, remove its entry from this list
//   AND subtract 1 from MOCK_VISITOR_OFFSET so the offset stays correct.
//
// IMPORTANT: Do NOT clear this list without adjusting MOCK_VISITOR_OFFSET —
// otherwise the displayed visitor count will drop by the number of entries removed.
//
const VISITOR_MOCK_CITIES = [
  // ── From LOCATION_PINS ──────────────────────────────────────────
  { city: 'Pittsburgh',     country: 'United States', country_code: 'US', lat:  40.4433, lng:  -79.9436 },
  { city: 'New York',       country: 'United States', country_code: 'US', lat:  40.7128, lng:  -74.0060 },
  { city: 'Cambridge',      country: 'United States', country_code: 'US', lat:  42.3601, lng:  -71.0589 },
  { city: 'Vancouver',      country: 'Canada',        country_code: 'CA', lat:  49.2606, lng: -123.2460 },
  { city: 'Tehran',         country: 'Iran',          country_code: 'IR', lat:  35.6892, lng:   51.3890 },
  { city: 'Singapore',      country: 'Singapore',     country_code: 'SG', lat:   1.3521, lng:  103.8198 },
  { city: 'Rio de Janeiro', country: 'Brazil',        country_code: 'BR', lat: -22.9068, lng:  -43.1729 },
  { city: 'Seoul',          country: 'South Korea',   country_code: 'KR', lat:  37.5665, lng:  126.9780 },
  // ── From CONFERENCE_PINS only (not already in LOCATION_PINS) ────
  { city: 'New Orleans',    country: 'United States', country_code: 'US', lat:  29.9511, lng:  -90.0715 },
  { city: 'San Diego',      country: 'United States', country_code: 'US', lat:  32.7157, lng: -117.1611 },
  { city: 'Berkeley',       country: 'United States', country_code: 'US', lat:  37.8716, lng: -122.2727 },
  { city: 'Seattle',        country: 'United States', country_code: 'US', lat:  47.6062, lng: -122.3321 },
];

// Starting visitor count offset — equals the number of mock cities above.
// Decrement by 1 each time you remove an entry from VISITOR_MOCK_CITIES.
// Set to 0 (and remove both this and VISITOR_MOCK_CITIES) when all cities
// have real visitor data and you no longer need the artificial head-start.
const MOCK_VISITOR_OFFSET = 12;

// Unique countries represented in the mock cities above.
// Used to seed the countries counter before real visitor data exists.
const MOCK_VISITOR_COUNTRIES = [
  'United States',
  'Canada',
  'Iran',
  'Singapore',
  'Brazil',
  'South Korea',
];
