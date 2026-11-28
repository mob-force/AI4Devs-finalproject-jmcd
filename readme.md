## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

### **0.2. Nombre del proyecto:**

### **0.3. Descripción breve del proyecto:**

Know Your Package (KYP) es un MVP de una herramienta gratuita, utilizada dentro de Salesforce, que ofrece a los Package Owners de partners ISV una vista visual, sencilla y actualizada de sus paquetes gestionados de segunda generación (2GP): qué paquetes y versiones existen, cómo se relacionan y qué clientes usan cada versión.

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

> Propósito del producto. Qué valor aporta, qué soluciona, y para quién.

La idea completa, con sus fuentes y supuestos, está en [docs/product/idea.md](docs/product/idea.md).

**Para quién:** partners ISV de Salesforce que desarrollan y distribuyen paquetes gestionados 2GP. El usuario principal es el Package Owner, la persona responsable de los paquetes.

**Qué soluciona:** responder de forma rápida y legible a la pregunta «¿qué hemos construido y quién está usando qué?». La información sobre paquetes, versiones, dependencias, instalaciones y licencias está en distintos lugares de Salesforce. Los problemas siguientes son hipótesis todavía sin validar con usuarios:

- La información está dispersa y reunirla requiere trabajo manual.
- La salida de comandos, el código de grafos y las listas de registros cuestan de interpretar, sobre todo a quien no usa la línea de comandos.
- Las instalaciones se registran por org, mientras que suponemos que el partner razona en términos de clientes.

**Qué valor aporta:** un único lugar para la visión global, resúmenes y diagramas visuales, y respuestas expresadas en clientes además de orgs.

**Alternativa existente:** Package Visualizer, una aplicación gratuita de Salesforce Labs, ya cubre buena parte de esta idea. KYP quiere ser una alternativa, también gratuita, con una mejor experiencia de usuario. Esperamos lograrlo con una vista más sencilla, que empieza por el resumen y se expresa en clientes, una mejora validada según el criterio del Product Owner humano, pero todavía no probada.

**Objetivo principal:** que el Package Owner de un partner ISV pueda ver fácilmente, en un único lugar visual dentro de Salesforce, el estado actual de sus paquetes 2GP: qué paquetes y versiones existen, cómo se relacionan y qué clientes usan cada versión.

**Cómo sabremos que se ha logrado:** en la prueba de aceptación del MVP, al menos una persona que conoce el empaquetado 2GP y no ha recibido una explicación previa de KYP responde correctamente a las 4 preguntas siguientes, cada una en menos de 1 minuto y usando solo KYP. Una respuesta es correcta si coincide con los datos cargados en KYP en el momento de la prueba. Un cliente activo es el que tiene el paquete instalado actualmente en al menos una de sus orgs de producción, y cuenta una vez en cada versión instalada en esas orgs (supuesto validado por el Product Owner humano). Las condiciones completas de la prueba y sus supuestos están en [docs/product/idea.md](docs/product/idea.md).

1. ¿Cuántos paquetes tenemos y cuáles son la última versión promocionada y la última versión beta de cada uno?
2. En un paquete concreto, ¿cuántos clientes activos hay en cada versión?
3. En una versión concreta, ¿qué clientes y cuáles de sus orgs la están usando?
4. En una versión concreta, ¿de qué versión desciende y de qué paquetes depende?

**Alcance del MVP:** solo consulta información de paquetes gestionados 2GP, incluidas las dependencias y el árbol de versiones. Quedan fuera las actualizaciones push, la gestión de licencias, las analíticas de uso y otros tipos de paquete. En el MVP los datos se cargan a mano y la sincronización con la org del partner u otras fuentes de datos queda para una fase posterior, en la que se asume que la License Management App está en la misma org que el Dev Hub.

### **1.2. Características y funcionalidades principales:**

> Enumera y describe las características y funcionalidades específicas que tiene el producto para satisfacer las necesidades identificadas.

Los requisitos completos, con su identificador, prioridad y supuestos, están en [docs/product/prd.md](docs/product/prd.md). Es una propuesta: las prioridades y el límite detallado del MVP están pendientes de confirmar. Los supuestos están validados según el criterio del Product Owner humano. En el MVP el modelo de datos de la aplicación contiene toda la información necesaria y los datos se cargan a mano.

El MVP tiene cinco funcionalidades:

1. **Visión general:** número de paquetes gestionados 2GP y, para cada uno, la última versión promocionada, la última versión beta, un gráfico de clientes activos por versión y el total de clientes activos distintos. El gráfico incluye las versiones promocionadas y cualquier otra con una instalación actual, e indica cuántas versiones beta no se muestran. «Última» significa la creada más recientemente (supuesto validado por el Product Owner humano).
2. **Detalle de paquete:** datos del paquete, la lista de sus versiones con los clientes activos de cada una y la lista de los clientes que lo tienen instalado.
3. **Detalle de versión:** datos de la versión y una única lista de las orgs (producción y sandbox) que la usan, cada una con su cliente. Además, con prioridad recomendable, una lista de las versiones de todos los paquetes que se puede acotar a un paquete.
4. **Dependencias:** diagrama de las versiones de paquete de las que depende una versión, incluidas las de paquetes ajenos al Dev Hub. En la página del paquete se muestran las de su última versión promocionada o, si no hay ninguna, las de su última beta.
5. **Árbol de versiones:** relación de cada versión con su ancestro, distinguiendo las promocionadas de las beta.

**Reglas comunes a todas las funcionalidades:**

- Las orgs sin cliente conocido se muestran como «cliente desconocido»: no se suman a ningún cliente ni se ocultan.
- Solo se cuentan las instalaciones actuales. Los paquetes y versiones eliminados quedan fuera, salvo las versiones eliminadas que sigan instaladas, que se muestran marcadas como tales.
- Cuando una información no está disponible, KYP lo indica en lugar de mostrar un cero o una lista vacía.

**Requisitos no funcionales:** cada pregunta de referencia se responde en menos de 1 minuto; todo se consulta dentro de Salesforce; cada vista muestra los datos que KYP tiene en el momento de abrirla; los resultados son completos o avisan de que no lo son; KYP solo consulta; solo accede quien el partner autorice; y los datos de clientes, orgs y licencias no salen de las orgs de Salesforce del partner. Con prioridad recomendable: cada vista se muestra en menos de 10 segundos con los datos de prueba, y los gráficos y diagramas se entienden sin depender solo del color.

**Fuera del MVP:** sincronización de datos con la org del partner u otras fuentes, actualizaciones push, gestión de licencias, analíticas de uso, paquetes de primera generación, desbloqueados y no gestionados, Dev Hub y License Management App en orgs distintas, vista por cliente, consulta de qué paquetes dependen de uno dado, y búsqueda y filtros por cliente, org o número de versión.

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
> Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.


### **2.2. Descripción de componentes principales:**

> Describe los componentes más importantes, incluyendo la tecnología utilizada

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

> Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.


### **3.2. Descripción de entidades principales:**

> Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**

**Historia de Usuario 2**

**Historia de Usuario 3**

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1**

**Ticket 2**

**Ticket 3**

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

