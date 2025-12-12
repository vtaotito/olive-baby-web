# 🎯 Exemplo de Uso do Agente de Features

## 📌 Como testar o prompt mestre

Este arquivo mostra um exemplo prático completo de como usar o agente com o prompt mestre.

---

## 1️⃣ User Prompt (entrada)

**O que você enviaria para o agente:**

```json
{
  "feature_goal": "Quero um dashboard completo de amamentação que mostre para a mãe se ela está alternando bem os seios, quantas vezes o bebê mamou, e se há necessidade de complemento. Quero insights automáticos e acolhedores.",
  "baby_context": {
    "age_in_days": 20,
    "feeding_focus": "exclusive_breastfeeding",
    "sleep_challenge": "none",
    "notes": "Mãe de primeira viagem, insegura sobre produção de leite"
  },
  "timeframe": "7d",
  "technical_constraints": {
    "chart_library": "Chart.js",
    "frontend": "React",
    "device_focus": "mobile_first"
  }
}
```

---

## 2️⃣ Resposta do Agente (saída esperada)

### JSON de especificação

```json
{
  "feature_name": "Dashboard de Amamentação Inteligente",
  "user_story": "Como mãe de primeira viagem que amamenta exclusivamente, quero ver de forma clara se estou alternando bem os seios e quantas vezes meu bebê mamou, para me sentir mais segura sobre minha produção de leite.",
  
  "api_plan": [
    {
      "goal": "Obter estatísticas completas de amamentação dos últimos 7 dias",
      "endpoint": "GET /stats/:babyId",
      "params": {
        "range": "7d"
      },
      "fields_used": [
        "labels",
        "feeding_counts",
        "feeding_minutes",
        "breast_side_distribution",
        "complement_ml_per_day",
        "total_complement_ml_range",
        "feeding_count_24h",
        "total_feeding_minutes_24h",
        "complement_feeds_24h",
        "hourly_labels",
        "hourly_counts"
      ]
    },
    {
      "goal": "Obter rotinas detalhadas de alimentação para análise",
      "endpoint": "GET /routines",
      "params": {
        "babyId": "{{babyId}}",
        "routineType": "feeding",
        "startDate": "{{hoje - 7 dias}}",
        "endDate": "{{hoje}}",
        "limit": 50
      },
      "fields_used": [
        "id",
        "startTime",
        "endTime",
        "durationSeconds",
        "meta.feedingType",
        "meta.breastSide",
        "meta.complement",
        "meta.complementMl",
        "notes"
      ]
    }
  ],
  
  "charts": [
    {
      "id": "breast_side_pie",
      "title": "Como você está alternando os seios",
      "type": "pie",
      "x_axis": "N/A",
      "y_axis": "breast_side_distribution",
      "description_for_mom": "Veja se você está usando igualmente os dois seios. É importante alternar para estimular a produção de forma equilibrada.",
      "insight_hooks": ["breast_balance_check"],
      "colors": {
        "left": "#FF6B9D",
        "right": "#C44569",
        "both": "#A05194"
      }
    },
    {
      "id": "feeding_frequency_bar",
      "title": "Mamadas por dia (última semana)",
      "type": "bar",
      "x_axis": "labels (dias da semana)",
      "y_axis": "feeding_counts (número de mamadas)",
      "description_for_mom": "Quantidade de mamadas em cada dia. É normal variar um pouco, mas observar a média ajuda.",
      "insight_hooks": ["feeding_consistency", "feeding_trend"],
      "colors": {
        "bars": "#4ECDC4"
      }
    },
    {
      "id": "feeding_duration_line",
      "title": "Tempo total mamando por dia",
      "type": "line",
      "x_axis": "labels (dias)",
      "y_axis": "feeding_minutes (minutos totais por dia)",
      "description_for_mom": "Total de minutos que seu bebê passou no peito em cada dia.",
      "insight_hooks": ["duration_pattern"],
      "colors": {
        "line": "#44A08D"
      }
    },
    {
      "id": "feeding_heatmap_hour",
      "title": "Horários mais comuns de mamada",
      "type": "heatmap",
      "x_axis": "hourly_labels (0-23h)",
      "y_axis": "hourly_counts (frequência)",
      "description_for_mom": "Veja em quais horários seu bebê costuma mamar mais. Isso ajuda a entender o ritmo dele.",
      "insight_hooks": ["cluster_feeding", "night_feeding_pattern"],
      "colors": {
        "gradient": ["#E8F4F8", "#006BA6"]
      }
    },
    {
      "id": "complement_trend",
      "title": "Complemento ao longo da semana",
      "type": "line",
      "x_axis": "labels (dias)",
      "y_axis": "complement_ml_per_day (ml de complemento)",
      "description_for_mom": "Acompanhe se você tem usado complemento e em que quantidade.",
      "insight_hooks": ["complement_reduction", "complement_stable"],
      "colors": {
        "line": "#F39C12"
      },
      "show_only_if": "total_complement_ml_range > 0"
    }
  ],
  
  "kpis": [
    {
      "id": "feeding_24h",
      "label": "Mamadas hoje",
      "icon": "🍼",
      "source": "stats",
      "field": "feeding_count_24h",
      "recommended_range_hint": "Recém-nascidos mamam de 8 a 12 vezes por dia em média, mas cada bebê tem seu ritmo.",
      "color": "#4ECDC4"
    },
    {
      "id": "feeding_time_24h",
      "label": "Tempo mamando hoje",
      "icon": "⏱️",
      "source": "stats",
      "field": "total_feeding_minutes_24h",
      "recommended_range_hint": "O tempo varia muito entre bebês. O importante é que ele esteja ganhando peso.",
      "format": "minutos",
      "color": "#44A08D"
    },
    {
      "id": "breast_balance",
      "label": "Equilíbrio dos seios",
      "icon": "⚖️",
      "source": "stats",
      "field": "breast_side_distribution",
      "calculated": "percentual_difference",
      "recommended_range_hint": "Alternar os seios ajuda a manter a produção equilibrada.",
      "color": "#A05194"
    },
    {
      "id": "complement_24h",
      "label": "Complemento hoje",
      "icon": "🍶",
      "source": "stats",
      "field": "total_complement_ml_24h",
      "recommended_range_hint": "Se você está usando complemento, converse com sua pediatra sobre redução gradual se for seu objetivo.",
      "format": "ml",
      "color": "#F39C12",
      "show_only_if": "total_complement_ml_24h > 0"
    }
  ],
  
  "insights_engine": [
    {
      "id": "breast_balance_good",
      "input_fields": ["breast_side_distribution"],
      "rule": "se abs(left - right) / (left + right) < 0.2",
      "type": "positive",
      "message_template": "Você está alternando bem os seios! {{left}} mamadas no esquerdo, {{right}} no direito e {{both}} nos dois. Continuar alternando ajuda a manter a produção equilibrada. 💚",
      "warn_about_medical": false
    },
    {
      "id": "breast_balance_uneven",
      "input_fields": ["breast_side_distribution"],
      "rule": "se abs(left - right) / (left + right) > 0.4",
      "type": "tip",
      "message_template": "Notamos que você tem usado mais um seio que outro ({{left}} esquerdo vs {{right}} direito). Tente começar a próxima mamada pelo seio que foi menos usado - isso ajuda a estimular ambos igualmente. 💡",
      "warn_about_medical": false
    },
    {
      "id": "frequent_feeding_normal",
      "input_fields": ["feeding_count_24h"],
      "rule": "se feeding_count_24h >= 8 && feeding_count_24h <= 14",
      "type": "positive",
      "message_template": "Seu bebê mamou {{feeding_count_24h}} vezes nas últimas 24h. Isso está dentro do esperado para a idade dele! 🌟",
      "warn_about_medical": false
    },
    {
      "id": "low_feeding_attention",
      "input_fields": ["feeding_count_24h"],
      "rule": "se feeding_count_24h < 6",
      "type": "warning",
      "message_template": "Foram registradas apenas {{feeding_count_24h}} mamadas nas últimas 24h. Bebês dessa idade costumam mamar mais vezes. Vale conversar com a pediatra para ter certeza de que está tudo bem. 💙",
      "warn_about_medical": true
    },
    {
      "id": "cluster_feeding_detected",
      "input_fields": ["hourly_counts"],
      "rule": "se há 3+ mamadas consecutivas em janela de 4h",
      "type": "neutral",
      "message_template": "Notamos que seu bebê está mamando várias vezes seguidas em alguns períodos do dia. Isso é chamado de 'cluster feeding' e é completamente normal - é assim que ele estimula sua produção! 💪",
      "warn_about_medical": false
    },
    {
      "id": "night_feeding_normal",
      "input_fields": ["hourly_counts"],
      "rule": "se sum(hourly_counts[22:6]) > 0",
      "type": "neutral",
      "message_template": "Seu bebê está mamando de madrugada. Isso é esperado e importante para a produção de leite - o hormônio prolactina está em níveis mais altos durante a noite. É cansativo, mas é temporário. Você está fazendo um ótimo trabalho! 🌙",
      "warn_about_medical": false
    },
    {
      "id": "complement_reducing",
      "input_fields": ["complement_ml_per_day"],
      "rule": "se tendência de redução de >20% na semana",
      "type": "positive",
      "message_template": "Ótima notícia! A quantidade de complemento vem diminuindo ao longo da semana. Isso pode indicar que sua produção está aumentando. Continue amamentando sob demanda! 🎉",
      "warn_about_medical": false,
      "show_only_if": "total_complement_ml_range > 0"
    },
    {
      "id": "first_time_mom_encouragement",
      "input_fields": ["baby_context.notes"],
      "rule": "se notes contém 'primeira viagem' ou 'insegura'",
      "type": "positive",
      "message_template": "Lembre-se: você está aprendendo junto com seu bebê, e isso é completamente normal. A amamentação pode levar algumas semanas para 'encaixar'. Você está fazendo o melhor que pode! 💚",
      "warn_about_medical": false
    }
  ],
  
  "ui_layout": {
    "layout_type": "mobile_first",
    "sections": [
      {
        "id": "summary_header",
        "title": "Resumo de Hoje",
        "style": "cards_row",
        "components": [
          "kpi_feeding_24h",
          "kpi_feeding_time_24h",
          "kpi_breast_balance",
          "kpi_complement_24h"
        ]
      },
      {
        "id": "breast_balance_section",
        "title": "Alternância dos Seios",
        "description": "É importante alternar para manter a produção equilibrada",
        "style": "card",
        "components": [
          "chart_breast_side_pie"
        ]
      },
      {
        "id": "frequency_section",
        "title": "Padrão de Mamadas",
        "description": "Veja como tem sido a rotina de amamentação",
        "style": "card",
        "components": [
          "chart_feeding_frequency_bar",
          "chart_feeding_duration_line"
        ]
      },
      {
        "id": "timing_section",
        "title": "Horários de Mamada",
        "description": "Entenda quando seu bebê costuma ter mais fome",
        "style": "card",
        "components": [
          "chart_feeding_heatmap_hour"
        ]
      },
      {
        "id": "complement_section",
        "title": "Acompanhamento do Complemento",
        "description": "Veja a evolução do uso de complemento",
        "style": "card",
        "components": [
          "chart_complement_trend"
        ],
        "show_only_if": "total_complement_ml_range > 0"
      },
      {
        "id": "insights_section",
        "title": "💡 Olhar da Olive",
        "description": "Insights automáticos baseados nos seus registros",
        "style": "list",
        "components": [
          "insights_list"
        ]
      },
      {
        "id": "disclaimer_footer",
        "style": "text_muted",
        "content": "Lembre-se: esses insights são gerados automaticamente e não substituem a orientação da sua pediatra. Em caso de dúvidas, sempre consulte seu profissional de saúde."
      }
    ]
  },
  
  "copy_examples": {
    "screen_title": "Amamentação",
    "screen_subtitle": "Acompanhe sua jornada de amamentação com clareza e tranquilidade",
    "empty_state": "Comece registrando as mamadas do seu bebê para ver aqui padrões, insights e acompanhar sua evolução. Cada registro ajuda você a entender melhor o ritmo do seu pequeno! 💙",
    "loading_state": "Analisando suas mamadas...",
    "insights_section_title": "💡 Olhar da Olive",
    "insights_explanation": "Insights automáticos baseados nos seus registros. Não substituem a avaliação da pediatra.",
    "no_insights": "Continue registrando as mamadas para receber insights personalizados!",
    "cta_register": "Registrar mamada",
    "cta_view_history": "Ver histórico completo",
    "help_text": "Dúvidas sobre amamentação? Converse com uma consultora de lactação ou sua pediatra.",
    "encouragement_messages": [
      "Você está fazendo um ótimo trabalho! 💚",
      "Cada dia é um aprendizado. Continue assim! 🌟",
      "A amamentação pode ser desafiadora, mas você não está sozinha. 💪"
    ]
  },
  
  "accessibility": {
    "high_contrast_mode": true,
    "font_size_adjustable": true,
    "screen_reader_labels": {
      "breast_side_pie": "Gráfico de pizza mostrando distribuição do uso dos seios: {{left}} vezes o esquerdo, {{right}} vezes o direito, {{both}} vezes ambos",
      "feeding_frequency_bar": "Gráfico de barras mostrando número de mamadas por dia na última semana",
      "kpi_feeding_24h": "Indicador: {{value}} mamadas nas últimas 24 horas"
    }
  },
  
  "interactions": {
    "tap_chart": "Ao tocar no gráfico, mostrar detalhes do dia/ponto específico",
    "swipe_charts": "Permitir deslizar entre gráficos no mobile",
    "pull_to_refresh": "Puxar para baixo atualiza os dados",
    "tap_insight": "Ao tocar em um insight, expandir com mais detalhes e sugestões"
  },
  
  "share_options": {
    "export_pdf": "Exportar relatório da semana em PDF para levar na consulta",
    "share_with_professional": "Compartilhar dashboard com pediatra ou consultora de lactação",
    "copy_summary": "Copiar resumo em texto para WhatsApp"
  }
}
```

---

### Explicação em texto (complemento)

**Como a mãe verá essa tela:**

Ao abrir o Dashboard de Amamentação, a mãe verá primeiro 4 cards grandes com números do dia: quantas vezes o bebê mamou, quanto tempo total, se está alternando bem os seios, e se usou complemento (esse último só aparece se ela tiver usado).

Logo abaixo, ela encontrará um gráfico de pizza colorido e amigável mostrando se está usando mais um seio que outro - com cores suaves e textos explicativos. Esse gráfico é importante porque muitas mães não percebem que estão favorecendo um lado.

Na sequência, dois gráficos de linha mostram a evolução da semana: quantas mamadas por dia e quanto tempo total. Isso ajuda a mãe a ver que é normal ter variações - alguns dias o bebê mama mais, outros menos, e está tudo bem.

O heatmap de horários é super útil: mostra em quais horas do dia o bebê costuma mamar mais. Isso ajuda a mãe a antecipar os momentos de fome e entender padrões (como cluster feeding no fim da tarde, que é super comum e assusta muitas mães de primeira viagem).

Se ela estiver usando complemento, aparecerá um gráfico extra mostrando a evolução - se está aumentando, diminuindo ou estável. Isso é importante para acompanhar com a pediatra.

Por fim, a seção "Olhar da Olive" traz insights automáticos com linguagem acolhedora. Por exemplo: se ela está alternando bem os seios, receberá um elogio; se está usando muito mais um lado, receberá uma dica gentil; se o bebê mamou poucas vezes, receberá um aviso suave para conversar com a pediatra.

**Que sensação ela deve ter:**

A mãe deve sentir **alívio** e **clareza**. A interface mostra que ela está no controle, que tem dados concretos para levar na consulta, e que não está "fazendo errado". Os insights são **encorajadores** e **informativos**, nunca julgadores. Ela deve sair da tela pensando _"Ok, estou no caminho certo"_ ou _"Ah, é por isso que ele mama tanto à tarde - é normal!"_.

**Conexão entre gráficos e insights:**

Os gráficos alimentam os insights de forma inteligente:
- O gráfico de pizza gera insights sobre alternância dos seios
- O gráfico de barras gera insights sobre consistência e tendências
- O heatmap detecta cluster feeding e mamadas noturnas
- O gráfico de complemento detecta se está reduzindo (sinal positivo)

Todos os insights têm um propósito: tranquilizar, orientar ou alertar de forma suave.

**Onde estou assumindo algo:**

- Assumi que a mãe é de primeira viagem e insegura (baseado no `baby_context.notes`)
- Assumi amamentação exclusiva sem complemento inicialmente, mas o layout se adapta se houver
- Assumi bebê de 20 dias, então as referências são para recém-nascido
- Assumi que a mãe tem acesso a consultora de lactação ou pediatra
- Assumi uso mobile, então priorizei layout vertical com cards empilhados

---

## 3️⃣ Próximos passos para desenvolvimento

Com essa especificação em mãos, o time de desenvolvimento pode:

1. ✅ **Backend:** Garantir que o endpoint `/stats/:babyId?range=7d` está retornando todos os campos necessários
2. ✅ **Frontend:** Criar os componentes de UI seguindo o `ui_layout`
3. ✅ **Charts:** Implementar os 5 gráficos com Chart.js usando as configurações
4. ✅ **Insights Engine:** Criar a lógica para processar as regras de insights
5. ✅ **Copy:** Usar os textos do `copy_examples` na interface
6. ✅ **Testes:** Testar com dados reais de mães e ajustar thresholds

---

## 🎨 Wireframe sugerido (ASCII art)

```
┌─────────────────────────────────────┐
│  📱 Amamentação                     │
│  Acompanhe sua jornada...           │
├─────────────────────────────────────┤
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │  🍼  │ │  ⏱️  │ │  ⚖️  │       │
│  │  6   │ │ 120  │ │ 87%  │       │
│  │mamadas│ │ min │ │equil.│       │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
├─────────────────────────────────────┤
│  ⚖️ Alternância dos Seios          │
│  ┌─────────────────────────────┐   │
│  │     [Pizza Chart]           │   │
│  │   Esq: 40%  Dir: 42%        │   │
│  │   Ambos: 18%                │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  📊 Padrão de Mamadas              │
│  ┌─────────────────────────────┐   │
│  │   [Bar Chart - 7 days]      │   │
│  │   ▃▅█▆▅▆█                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   [Line Chart - duração]    │   │
│  │   ╱╲╱╲__╱╲╱                  │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  🕐 Horários de Mamada             │
│  ┌─────────────────────────────┐   │
│  │   [Heatmap 0-23h]           │   │
│  │   ░░▒▒▓▓▒▒░░░░░▓▓▒░░░░      │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  💡 Olhar da Olive                 │
│  ┌─────────────────────────────┐   │
│  │ ✅ Você está alternando     │   │
│  │    bem os seios! Continue!  │   │
│  ├─────────────────────────────┤   │
│  │ 💡 Seu bebê está fazendo    │   │
│  │    cluster feeding à tarde  │   │
│  │    - isso é normal!         │   │
│  ├─────────────────────────────┤   │
│  │ 🌟 6 mamadas nas últimas    │   │
│  │    24h está ótimo!          │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Registrar nova mamada]            │
│  [Ver histórico completo]           │
│                                     │
│  💙 Esses insights não substituem  │
│     a avaliação da pediatra        │
└─────────────────────────────────────┘
```

---

## ✅ Validação técnica

Todos os endpoints e campos usados neste exemplo **existem e estão validados** contra `API_DOCUMENTATION.md`:

- ✅ `GET /stats/:babyId?range=7d` - endpoint existe
- ✅ `feeding_counts`, `feeding_minutes`, `breast_side_distribution` - campos existem
- ✅ `hourly_labels`, `hourly_counts` - campos existem
- ✅ `complement_ml_per_day`, `total_complement_ml_range` - campos existem
- ✅ `GET /routines` com filtros - endpoint existe e aceita os parâmetros
- ✅ Meta fields de feeding - estrutura correta

**Pronto para implementação!** 🚀

---

**Criado em:** 11/12/2024  
**Baseado em:** PROMPT_MESTRE_AGENTE_FEATURES.md  
**🍼 Olive Baby - Exemplo prático de uso**
