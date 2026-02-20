# 🤖 AI Agent API | واجهة برمجة وكيل الخبير الاصطناعي | KI-Agent-API

توثيق تفصيلي لواجهة برمجة تطبيقات نظام الـ AI Agent في Stampcoin Platform.

## نظرة عامة | Overview | Übersicht

يوفر نظام الـ AI Agent واجهات برمجة للتفاعل مع الذكاء الاصطناعي لمساعدة المستخدمين وتحسين أداء النظام.

## نقاط النهاية الرئيسية | Main Endpoints | Hauptendpunkte

### 1. الحصول على حالة الوكيل | Get Agent Status | Agent-Status abrufen

**GET** `/api/agent/status`

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X GET https://api.stampcoin.com/api/agent/status
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "agent": {
    "status": "active",
    "version": "1.0.0",
    "uptime": "2d 5h 30m",
    "tasks": {
      "completed": 142,
      "failed": 5,
      "inProgress": 3
    },
    "capabilities": [
      "code-analysis",
      "bug-fixing",
      "project-organization",
      "performance-optimization",
      "security-audit",
      "documentation",
      "test-generation"
    ]
  }
}
```

### 2. تحليل الكود | Analyze Code | Code-Analyse

**POST** `/api/agent/analyze-code`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| filePath | string | نعم | مسار ملف الكود |
| analysisType | string | نعم | نوع التحليل (quality, complexity, security, performance) |
| outputFormat | string | لا | تنسيق المخرجات (json, html, pdf) |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/agent/analyze-code   -H "Content-Type: application/json"   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."   -d '{
    "filePath": "./src/services/auth.js",
    "analysisType": "quality",
    "outputFormat": "json"
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "analysis": {
    "filePath": "./src/services/auth.js",
    "type": "quality",
    "score": 85,
    "metrics": {
      "maintainability": 88,
      "readability": 82,
      "testability": 85
    },
    "issues": [
      {
        "type": "code-smell",
        "severity": "medium",
        "description": "دالة طويلة تحتوي على العديد من المسؤوليات",
        "line": 45,
        "suggestion": "نقسم الدالة إلى دوال أصغر وأكثر تركيزًا"
      },
      {
        "type": "redundancy",
        "severity": "low",
        "description": "تكرار في كود التحقق من صحة المدخلات",
        "line": 78,
        "suggestion": "إنشاء دالة مساعدة للتحقق من المدخلات"
      }
    ],
    "recommendations": [
      "تحسين التعليقات التوضيحية للكود المعقد",
      "إضافة اختبارات لوحدة المصادقة",
      "تبسيط منطق المصادقة"
    ]
  }
}
```

### 3. إصلاح المشاكل | Fix Issues | Probleme beheben

**POST** `/api/agent/fix-issues`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| issues | array | نعم | قائمة المشكلات التي يجب إصلاحها |
| autoApply | boolean | لا | تطبيق التغييرات تلقائيًا (افتراضي: false) |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/agent/fix-issues   -H "Content-Type: application/json"   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."   -d '{
    "issues": [
      {
        "type": "security",
        "severity": "high",
        "description": "ثغرة محتملة في المصادقة",
        "filePath": "./src/services/auth.js",
        "line": 45
      },
      {
        "type": "performance",
        "severity": "medium",
        "description": "استعلام غير فعال في قاعدة البيانات",
        "filePath": "./src/database/queries.js",
        "line": 120
      }
    ],
    "autoApply": false
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "fixes": [
    {
      "issue": {
        "type": "security",
        "severity": "high",
        "description": "ثغرة محتملة في المصادقة",
        "filePath": "./src/services/auth.js",
        "line": 45
      },
      "suggestedFix": "إضافة دالة للتحقق من صحة توكين JWT قبل استخدامه",
      "codeChange": "// قبل
const user = jwt.decode(token);

// بعد
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const user = decoded.user;",
      "estimatedTime": "15 دقيقة",
      "riskLevel": "منخفض"
    },
    {
      "issue": {
        "type": "performance",
        "severity": "medium",
        "description": "استعلام غير فعال في قاعدة البيانات",
        "filePath": "./src/database/queries.js",
        "line": 120
      },
      "suggestedFix": "تحسين الاستعلام باستخدام الفهرسة وتقليل البيانات المطلوبة",
      "codeChange": "// قبل
User.find({}).populate("orders").exec()

// بعد
User.find({}, "name email").populate({
  path: "orders",
  select: "id total"
}).exec()",
      "estimatedTime": "10 دقائق",
      "riskLevel": "منخفض"
    }
  ],
  "summary": {
    "totalIssues": 2,
    "highPriorityIssues": 1,
    "mediumPriorityIssues": 1,
    "estimatedTotalTime": "25 دقيقة"
  }
}
```

### 4. تنظيم المشروع | Organize Project | Projekt organisieren

**POST** `/api/agent/organize-project`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| organizationType | string | نعم | نوع التنظيم (by-feature, by-layer, by-domain) |
| dryRun | boolean | لا | تجربة التنظيم دون تطبيق التغييرات (افتراضي: false) |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/agent/organize-project   -H "Content-Type: application/json"   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."   -d '{
    "organizationType": "by-feature",
    "dryRun": true
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "organization": {
    "type": "by-feature",
    "currentStructure": {
      "src": {
        "controllers": ["auth.js", "user.js", "stamp.js"],
        "services": ["auth.js", "user.js", "stamp.js"],
        "models": ["user.js", "stamp.js", "order.js"],
        "utils": ["validation.js", "crypto.js"]
      }
    },
    "proposedStructure": {
      "src": {
        "auth": {
          "controllers": ["auth.js"],
          "services": ["auth.js"],
          "models": ["user.js"]
        },
        "stamps": {
          "controllers": ["stamp.js"],
          "services": ["stamp.js"],
          "models": ["stamp.js"]
        },
        "orders": {
          "controllers": ["order.js"],
          "services": ["order.js"],
          "models": ["order.js"]
        },
        "shared": {
          "utils": ["validation.js", "crypto.js"]
        }
      }
    },
    "changes": [
      {
        "action": "move",
        "from": "src/controllers/user.js",
        "to": "src/auth/controllers/user.js"
      },
      {
        "action": "move",
        "from": "src/services/user.js",
        "to": "src/auth/services/user.js"
      },
      {
        "action": "create",
        "path": "src/auth/index.js",
        "content": "// وحدة تصدير لمكونات المصادقة"
      }
    ],
    "estimatedTime": "30 دقيقة",
    "riskLevel": "متوسط",
    "recommendations": [
      "احتفظ بنسخة احتياطية من الكود قبل التنظيم",
      "تحديث استيرادات الملفات بعد التنظيم",
      "تحديث المسارات في ملفات التكوين"
    ]
  }
}
```

### 5. تحسين الأداء | Optimize Performance | Leistung optimieren

**POST** `/api/agent/optimize-performance`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| targetArea | string | نعم | المنطقة المستهدفة (database, frontend, backend, overall) |
| optimizationLevel | string | لا | مستوى التحسين (basic, advanced, aggressive) |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/agent/optimize-performance   -H "Content-Type: application/json"   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."   -d '{
    "targetArea": "database",
    "optimizationLevel": "advanced"
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "optimization": {
    "targetArea": "database",
    "level": "advanced",
    "currentMetrics": {
      "queryTime": 120,
      "responseTime": 350,
      "throughput": 85,
      "errorRate": 2.5
    },
    "recommendations": [
      {
        "type": "indexing",
        "description": "إضافة فهرسات لتحسين سرعة الاستعلامات",
        "queries": [
          "CREATE INDEX idx_user_email ON users(email)",
          "CREATE INDEX idx_stamp_category ON stamps(category)",
          "CREATE INDEX idx_order_status ON orders(status)"
        ]
      },
      {
        "type": "query-optimization",
        "description": "تحسين الاستعلامات المعقدة",
        "queries": [
          {
            "original": "SELECT * FROM orders JOIN users ON orders.userId = users.id WHERE orders.status = "completed"",
            "optimized": "SELECT orders.id, orders.total, orders.date, users.name FROM orders JOIN users ON orders.userId = users.id WHERE orders.status = "completed""
          }
        ]
      },
      {
        "type": "caching",
        "description": "تطبيق التخزين المؤقت لبيانات ثابتة",
        "implementation": "Redis للبيانات التي لا تتغير كثيرًا"
      }
    ],
    "expectedImprovements": {
      "queryTime": "-60%",
      "responseTime": "-45%",
      "throughput": "+30%",
      "errorRate": "-1.5%"
    },
    "estimatedTime": "45 دقيقة",
    "riskLevel": "منخفض"
  }
}
```

### 6. التدقيق الأمني | Audit Security | Sicherheitsprüfung

**POST** `/api/agent/audit-security`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| scanDepth | string | نعم | عمق الفحص (basic, deep, comprehensive) |
| includeDependencies | boolean | لا | تضمين فحص الاعتماديات (افتراضي: true) |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/agent/audit-security   -H "Content-Type: application/json"   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."   -d '{
    "scanDepth": "deep",
    "includeDependencies": true
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "securityAudit": {
    "scanDate": "2023-05-15T14:30:00Z",
    "scanDepth": "deep",
    "scope": {
      "filesScanned": 245,
      "dependenciesScanned": 56,
      "linesOfCodeAnalyzed": 5420
    },
    "findings": {
      "critical": 1,
      "high": 3,
      "medium": 7,
      "low": 12
    },
    "vulnerabilities": [
      {
        "id": "CVE-2023-1234",
        "severity": "critical",
        "title": "ثغرة حقن SQL في واجهة المستخدم",
        "description": "هناك ثغرة محتملة في معالجة مدخلات المستخدم في واجهة المستخدم",
        "affectedFiles": ["./src/controllers/user.js"],
        "affectedLines": [45, 78],
        "recommendations": [
          "استخدام استعلامات آنية (prepared statements)",
          "تحقق من جميع مدخلات المستخدم",
          "استخدام مكتبات آمنة للتعامل مع قواعد البيانات"
        ],
        "references": [
          "https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2023-1234"
        ]
      },
      {
        "id": "CVE-2023-5678",
        "severity": "high",
        "title": "ثغرة في مكتبة المصادقة",
        "description": "إصدار قديم من مكتبة JWT يحتوي على ثغرة أمنية",
        "affectedDependencies": ["jsonwebtoken:9.0.0"],
        "recommendations": [
          "تحديث المكتبة إلى الإصدار 9.0.2 أو أحدث",
          "إعادة إنشاء جميع التوكنات القديمة"
        ],
        "references": [
          "https://nvd.nist.gov/vuln/detail/CVE-2023-5678"
        ]
      }
    ],
    "compliance": {
      "OWASP Top 10": {
        "score": 85,
        "passed": 7,
        "failed": 3
      },
      "GDPR": {
        "score": 92,
        "passed": 11,
        "failed": 1
      }
    },
    "report": {
      "format": "pdf",
      "url": "https://api.stampcoin.com/reports/security-audit-2023-05-15.pdf"
    }
  }
}
```

### 7. إنشاء الوثائق | Generate Documentation | Dokumentation generieren

**POST** `/api/agent/generate-docs`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| docType | string | نعم | نوع التوثيق (api, user-guide, developer-guide, architecture) |
| targetFiles | array | لا | الملفات المستهدفة |
| outputFormat | string | لا | تنسيق المخرجات (markdown, html, pdf) |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/agent/generate-docs   -H "Content-Type: application/json"   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."   -d '{
    "docType": "api",
    "targetFiles": ["./src/api/routes/*.js"],
    "outputFormat": "markdown"
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "documentation": {
    "type": "api",
    "targetFiles": [
      "./src/api/routes/auth.js",
      "./src/api/routes/user.js",
      "./src/api/routes/stamp.js"
    ],
    "generatedFiles": [
      {
        "name": "API-Documentation.md",
        "path": "./docs/api/API-Documentation.md",
        "size": 24500,
        "format": "markdown"
      },
      {
        "name": "API-Documentation.html",
        "path": "./docs/api/API-Documentation.html",
        "size": 58000,
        "format": "html"
      }
    ],
    "summary": {
      "endpointsDocumented": 24,
      "totalRequests": 156,
      "averageResponseTime": "120ms",
      "documentationCoverage": "95%"
    },
    "estimatedTime": "20 دقيقة"
  }
}
```

### 8. إنشاء الاختبارات | Create Tests | Tests erstellen

**POST** `/api/agent/create-tests`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| testType | string | نعم | نوع الاختبار (unit, integration, e2e) |
| targetFiles | array | لا | الملفات المستهدفة |
| coverageTarget | number | لا | نسبة التغطية المستهدفة (افتراضي: 80) |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/agent/create-tests   -H "Content-Type: application/json"   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."   -d '{
    "testType": "unit",
    "targetFiles": ["./src/services/*.js"],
    "coverageTarget": 90
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "tests": {
    "type": "unit",
    "targetFiles": [
      "./src/services/auth.js",
      "./src/services/user.js",
      "./src/services/stamp.js"
    ],
    "generatedFiles": [
      {
        "name": "auth.test.js",
        "path": "./tests/unit/auth.test.js",
        "size": 8500,
        "coverage": "92%"
      },
      {
        "name": "user.test.js",
        "path": "./tests/unit/user.test.js",
        "size": 12000,
        "coverage": "88%"
      },
      {
        "name": "stamp.test.js",
        "path": "./tests/unit/stamp.test.js",
        "size": 9500,
        "coverage": "95%"
      }
    ],
    "summary": {
      "totalTests": 45,
      "passedTests": 42,
      "failedTests": 3,
      "coverage": "91.7%",
      "targetCoverage": "90%",
      "status": "مُرضٍ"
    },
    "recommendations": [
      "إضافة اختبارات للمسارات النادرة في دالة المصادقة",
      "تحسين تغطية اختبارات معالجة الأخطاء"
    ],
    "estimatedTime": "25 دقيقة"
  }
}
```

## كود حالة الاستجابة | HTTP Status Codes | HTTP-Statuscodes

| الكود | الوصف |
|------|------|
| 200 | نجاح الطلب |
| 400 | معاملات غير صحيحة |
| 401 | غير مصرح به |
| 403 | ممنوع |
| 422 | بيانات غير صالحة |
| 500 | خطأ داخلي في الخادم |

## أخطاء شائعة | Common Errors | Häufige Fehler

### خطأ: الوكيل غير نشط | Error: Agent Not Active | Fehler: Agent nicht aktiv

```
{
  "success": false,
  "error": "AGENT_NOT_ACTIVE",
  "message": "وكيل الخبير الاصطناعي غير نشط حاليًا"
}
```

**الحل**: تأكد من أن الـ AI Agent نشط وقيد التشغيل.

### خطأ: ملف غير موجود | Error: File Not Found | Fehler: Datei nicht gefunden

```
{
  "success": false,
  "error": "FILE_NOT_FOUND",
  "message": "الملف المحدد غير موجود"
}
```

**الحل**: تحقق من صحة مسار الملف وتأكد من وجوده.

### خطأ: مهلة انتهت | Error: Timeout | Fehler: Zeitüberschreitung

```
{
  "success": false,
  "error": "TIMEOUT",
  "message": "انتهت مهلة معالجة الطلب"
}
```

**الحل**: قم بتقليل حجم الملفات أو المعاملات أو حاول مرة أخرى لاحقًا.

## مثال تطبيقي | Practical Example | Praktisches Beispiel

```javascript
// مثال JavaScript لتحليل كود
const analyzeCode = async (filePath, analysisType) => {
  try {
    const response = await fetch('https://api.stampcoin.com/api/agent/analyze-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        filePath,
        analysisType
      })
    });

    if (!response.ok) {
      throw new Error(`فشل الطلب: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log('تم تحليل الكود بنجاح');
      return data.analysis;
    } else {
      throw new Error(data.message || 'فشل تحليل الكود');
    }
  } catch (error) {
    console.error('خطأ:', error);
    return null;
  }
};

// مثال JavaScript لإصلاح المشاكل
const fixIssues = async (issues) => {
  try {
    const response = await fetch('https://api.stampcoin.com/api/agent/fix-issues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        issues,
        autoApply: false
      })
    });

    if (!response.ok) {
      throw new Error(`فشل الطلب: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log('تم اقتراح الحلول بنجاح');
      return data.fixes;
    } else {
      throw new Error(data.message || 'فشل اقتراح الحلول');
    }
  } catch (error) {
    console.error('خطأ:', error);
    return null;
  }
};

// مثال JavaScript لتنظيم المشروع
const organizeProject = async (organizationType, dryRun = true) => {
  try {
    const response = await fetch('https://api.stampcoin.com/api/agent/organize-project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        organizationType,
        dryRun
      })
    });

    if (!response.ok) {
      throw new Error(`فشل الطلب: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log('تم اقتراح تنظيم المشروع بنجاح');
      return data.organization;
    } else {
      throw new Error(data.message || 'فشل اقتراح تنظيم المشروع');
    }
  } catch (error) {
    console.error('خطأ:', error);
    return null;
  }
};

// مثال JavaScript لتوليد التوثيق
const generateDocumentation = async (docType, targetFiles, outputFormat = 'markdown') => {
  try {
    const response = await fetch('https://api.stampcoin.com/api/agent/generate-docs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        docType,
        targetFiles,
        outputFormat
      })
    });

    if (!response.ok) {
      throw new Error(`فشل الطلب: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log('تم توليد التوثيق بنجاح');
      return data.documentation;
    } else {
      throw new Error(data.message || 'فشل توليد التوثيق');
    }
  } catch (error) {
    console.error('خطأ:', error);
    return null;
  }
};
```

## الأمان | Security | Sicherheit

- جميع نقاط النهاية تتطلب JWT صالح في رأس الطلب: `Authorization: Bearer <token>`
- يجب استخدام HTTPS في جميع الاتصالات
- يجب عدم مشاركة مفتاح API مع أي طرف ثالث
- يجب تحديث مفتاح API بانتظام
